import { Capacitor } from '@capacitor/core';
import { Purchases, type PurchasesPackage } from '@revenuecat/purchases-capacitor';

// Chave pública da API RevenueCat para Google Play
const REVENUECAT_GOOGLE_KEY = ((import.meta as any).env?.VITE_REVENUECAT_GOOGLE_KEY as string) || 'goog_CRNtIOUfrDKdOvSyEuEZbdTsGAB';

let isInitialized = false;

export const initializeBilling = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  if (isInitialized) return true;

  try {
    await Purchases.configure({
      apiKey: REVENUECAT_GOOGLE_KEY,
    });
    isInitialized = true;
    return true;
  } catch (error) {
    console.warn('[Billing] Não foi possível conectar ao Google Play Billing:', error);
    return false;
  }
};

export const checkProStatus = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return localStorage.getItem('luthier_user_plan') === 'pro';
  }

  try {
    const isReady = await initializeBilling();
    if (!isReady) return localStorage.getItem('luthier_user_plan') === 'pro';

    const { customerInfo } = await Purchases.getCustomerInfo();
    const hasPro = Boolean(customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['pro_access']);
    if (hasPro) {
      localStorage.setItem('luthier_user_plan', 'pro');
    }
    return hasPro;
  } catch (e) {
    return localStorage.getItem('luthier_user_plan') === 'pro';
  }
};

export const purchaseProPackage = async (type: 'monthly' | 'yearly'): Promise<{ success: boolean; message?: string }> => {
  if (!Capacitor.isNativePlatform()) {
    // Ambiente web (desenvolvimento)
    localStorage.setItem('luthier_user_plan', 'pro');
    return { success: true };
  }

  try {
    await initializeBilling();
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    let packageToBuy: PurchasesPackage | undefined;

    if (currentOffering) {
      if (type === 'yearly') {
        packageToBuy = currentOffering.annual || currentOffering.availablePackages.find(p => p.identifier.includes('year') || p.identifier.includes('annual'));
      } else {
        packageToBuy = currentOffering.monthly || currentOffering.availablePackages.find(p => p.identifier.includes('month'));
      }
      if (!packageToBuy && currentOffering.availablePackages.length > 0) {
        packageToBuy = currentOffering.availablePackages[0];
      }
    }

    if (packageToBuy) {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
      const hasPro = Boolean(customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['pro_access']);
      if (hasPro) {
        localStorage.setItem('luthier_user_plan', 'pro');
        return { success: true };
      }
      return { success: false, message: 'Assinatura concluída, mas o status PRO ainda está sendo ativado.' };
    } else {
      return {
        success: false,
        message: 'Conectando ao Google Play... Os produtos de assinatura estão em sincronização com a loja. Tente novamente em breve.'
      };
    }
  } catch (error: any) {
    if (error?.userCancelled) {
      return { success: false, message: 'Assinatura cancelada.' };
    }
    console.warn('[Billing] Aviso de compra:', error);
    return {
      success: false,
      message: error?.message || 'Não foi possível completar a transação com a Google Play Store no momento.'
    };
  }
};

export const restoreProPurchases = async (): Promise<{ success: boolean; message: string }> => {
  if (!Capacitor.isNativePlatform()) {
    return { success: true, message: 'Compras restauradas.' };
  }

  try {
    await initializeBilling();
    const { customerInfo } = await Purchases.restorePurchases();
    const hasPro = Boolean(customerInfo.entitlements.active['pro'] || customerInfo.entitlements.active['pro_access']);
    if (hasPro) {
      localStorage.setItem('luthier_user_plan', 'pro');
      return { success: true, message: 'Assinatura PRO identificada e restaurada com sucesso!' };
    } else {
      return { success: false, message: 'Nenhuma assinatura ativa encontrada nesta conta do Google Play.' };
    }
  } catch (error: any) {
    return { success: false, message: error?.message || 'Falha ao consultar compras anteriores no Google Play.' };
  }
};
