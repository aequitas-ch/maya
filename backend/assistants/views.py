from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, F
from decimal import Decimal
from .models import Employee, Contract, WorkingHours, Payslip
from .serializers import EmployeeSerializer, ContractSerializer, WorkingHoursSerializer, PayslipSerializer
import datetime

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Employee.objects.filter(employer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_annual_statement(self, request, pk=None):
        employee = self.get_object()
        year = request.data.get('year', datetime.date.today().year)

        # Aggregate all payslips for the given year, securing against BOLA
        payslips = Payslip.objects.filter(
            working_hours__contract__employee=employee,
            working_hours__contract__employee__employer=request.user,
            working_hours__year=year
        )

        totals = payslips.aggregate(
            total_gross=Sum('gross_pay'),
            total_net=Sum('net_pay'),
            total_ahv=Sum('ahv_iv_eo_deduction'),
            total_alv=Sum('alv_deduction'),
            total_source_tax=Sum('source_tax_deduction'),
        )

        return Response({
            "employee_id": employee.id,
            "year": year,
            "totals": totals,
            "message": "Annual statement (Lohnausweis) generated successfully."
        })

class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contract.objects.filter(employee__employer=self.request.user)

    def perform_create(self, serializer):
        employee_id = self.request.data.get('employee')
        employee = get_object_or_404(Employee, id=employee_id, employer=self.request.user)
        serializer.save(employee=employee)

class WorkingHoursViewSet(viewsets.ModelViewSet):
    serializer_class = WorkingHoursSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkingHours.objects.filter(contract__employee__employer=self.request.user)

    def perform_create(self, serializer):
        contract_id = self.request.data.get('contract')
        contract = get_object_or_404(Contract, id=contract_id, employee__employer=self.request.user)
        serializer.save(contract=contract)

    def perform_update(self, serializer):
        contract_id = self.request.data.get('contract')
        if contract_id:
            contract = get_object_or_404(Contract, id=contract_id, employee__employer=self.request.user)
            serializer.save(contract=contract)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def generate_payslip(self, request, pk=None):
        working_hours = self.get_object()
        contract = working_hours.contract

        total_hours = working_hours.basic_hours + working_hours.overtime_hours + working_hours.sick_hours + working_hours.holiday_hours
        gross_pay = total_hours * contract.hourly_wage + working_hours.expenses

        # Simple dummy calculation for deductions (in real world this would use actual rates)
        # Assuming typical CH rates: AHV 5.3%, ALV 1.1%
        ahv_deduction = gross_pay * Decimal('0.053')
        alv_deduction = gross_pay * Decimal('0.011')
        bvg_deduction = Decimal('0') # Simplified
        source_tax_deduction = Decimal('0') # Simplified

        net_pay = gross_pay - (ahv_deduction + alv_deduction + bvg_deduction + source_tax_deduction)
        employer_costs = ahv_deduction + alv_deduction # Employer match

        payslip, created = Payslip.objects.update_or_create(
            working_hours=working_hours,
            defaults={
                'gross_pay': gross_pay,
                'ahv_iv_eo_deduction': ahv_deduction,
                'alv_deduction': alv_deduction,
                'bvg_deduction': bvg_deduction,
                'source_tax_deduction': source_tax_deduction,
                'net_pay': net_pay,
                'employer_costs': employer_costs
            }
        )

        serializer = PayslipSerializer(payslip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PayslipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayslipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payslip.objects.filter(working_hours__contract__employee__employer=self.request.user)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        year = request.query_params.get('year', datetime.date.today().year)

        payslips = Payslip.objects.filter(working_hours__contract__employee__employer=request.user, working_hours__year=year)

        monthly_costs = []
        for month in range(1, 13):
            month_payslips = payslips.filter(working_hours__month=month)
            totals = month_payslips.aggregate(
                gross=Sum('gross_pay'),
                employer_costs=Sum('employer_costs')
            )
            gross = totals['gross'] or 0
            employer_costs = totals['employer_costs'] or 0
            monthly_costs.append({
                'month': month,
                'total_cost': gross + employer_costs
            })

        employee_types = payslips.values('working_hours__contract__employee__type').annotate(
            total_gross=Sum('gross_pay'),
            total_employer_costs=Sum('employer_costs')
        )

        type_breakdown = []
        for et in employee_types:
            type_breakdown.append({
                'type': et['working_hours__contract__employee__type'],
                'cost': (et['total_gross'] or 0) + (et['total_employer_costs'] or 0)
            })

        return Response({
            'monthly_costs': monthly_costs,
            'type_breakdown': type_breakdown
        })

    @action(detail=False, methods=['get'])
    def iv_report(self, request):
        year = request.query_params.get('year', datetime.date.today().year)
        quarter = request.query_params.get('quarter', 1)

        months = []
        if quarter == '1':
            months = [1, 2, 3]
        elif quarter == '2':
            months = [4, 5, 6]
        elif quarter == '3':
            months = [7, 8, 9]
        elif quarter == '4':
            months = [10, 11, 12]

        payslips = Payslip.objects.filter(
            working_hours__contract__employee__employer=request.user,
            working_hours__contract__employee__type='IV_ASSISTANCE',
            working_hours__year=year,
            working_hours__month__in=months
        )

        totals = payslips.aggregate(
            total_gross=Sum('gross_pay'),
            total_ahv=Sum('ahv_iv_eo_deduction'),
            total_employer_costs=Sum('employer_costs')
        )

        return Response({
            'year': year,
            'quarter': quarter,
            'totals': totals,
            'payslips': PayslipSerializer(payslips, many=True).data
        })
