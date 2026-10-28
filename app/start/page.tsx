"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PrePaymentFlow } from "@/components/pre-payment/PrePaymentFlow";

export default function StartPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleCheckoutSuccess = async (resData: any) => {
    await refreshUser();
    router.push(`/dashboard?appId=${resData.applicationId}`);
  };

  return <PrePaymentFlow onSuccess={handleCheckoutSuccess} />;
}
