from rest_framework import serializers
from .models import Employee, Contract, WorkingHours, Payslip

class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = '__all__'
        read_only_fields = ['employee']

class EmployeeSerializer(serializers.ModelSerializer):
    contract = ContractSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['employer']

class PayslipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payslip
        fields = '__all__'

class WorkingHoursSerializer(serializers.ModelSerializer):
    payslip = PayslipSerializer(read_only=True)

    class Meta:
        model = WorkingHours
        fields = '__all__'
