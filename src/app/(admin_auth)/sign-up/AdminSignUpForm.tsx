"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/lib/schemas/formschemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/utils/trpc";
import z from "zod";
import { roleEnum } from "@/lib/schemas/data_schemas";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { setAuthSession } from "@/lib/auth/session";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function AdminSignUpForm() {
  const registerAuth = trpc.register.useMutation();
  const addProfile = trpc.createProfile.useMutation();
  const isPending = registerAuth.isPending || addProfile.isPending;
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      department: "",
      designation: "",
      full_name: "",
      password: "",
    },
  });

  async function onsubmit(formData: z.infer<typeof signUpSchema>) {
    try {
      const { email, password } = formData;
      const data = await registerAuth.mutateAsync({
        email,
        password,
        role: roleEnum.enum.test_admin,
      });

      setAuthSession(data.token);
      await addProfile.mutateAsync({
        department: formData.department,
        designation: formData.designation,
        full_name: formData.full_name,
        role: roleEnum.enum.test_admin,
      });

      router.replace("/test-admin-dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-5xl overflow-hidden border-slate-200 shadow-xl">
        <div className="grid md:grid-cols-2">
          {/* Left Panel */}
          <div className="flex flex-col items-center justify-center bg-slate-950 p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
            <p className="text-lg text-center">
              Join the Test Creation platform. Signing up takes less than a
              minute!
            </p>
          </div>

          {/* Right Panel */}
          <div className="p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-center text-2xl font-semibold text-slate-950">
                Admin Sign Up
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onsubmit)}
                  className="space-y-6"
                >
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department */}
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Computer Science, etc."
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Designation */}
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Professor, Student, etc."
                            {...field}
                            className="h-12 "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password with toggle */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="h-12 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-slate-950 text-white hover:bg-slate-800"
                    disabled={isPending}
                  >
                    {isPending ? "Creating..." : "Sign Up"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminSignUpForm;
