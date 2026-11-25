import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  display_name: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const ProfileSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  display_name: z.string().optional(),
  module_health_enabled: z.boolean().optional(),
  module_schedule_enabled: z.boolean().optional(),
  module_settlement_enabled: z.boolean().optional(),
  module_documents_enabled: z.boolean().optional(),
  module_assistants_enabled: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;

export const ChangePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters long'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "New passwords do not match",
  path: ["confirm_password"], // set the path of the error
});

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
