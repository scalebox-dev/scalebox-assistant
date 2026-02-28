import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type CustomerStage =
  | "initial_contact"
  | "demo"
  | "proposal"
  | "closed_won"
  | "closed_lost";

export interface FollowUpRecord {
  id: string;
  date: string;
  content: string;
  type: "call" | "email" | "meeting" | "note";
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  title: string;
  phone: string;
  email: string;
  stage: CustomerStage;
  notes: string;
  industry: string;
  followUps: FollowUpRecord[];
  createdAt: string;
  updatedAt: string;
}

export const STAGE_INFO: Record<
  CustomerStage,
  { label: string; color: string; bgColor: string; order: number }
> = {
  initial_contact: {
    label: "初接触",
    color: "#6C47FF",
    bgColor: "#6C47FF20",
    order: 0,
  },
  demo: {
    label: "演示中",
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    order: 1,
  },
  proposal: {
    label: "报价中",
    color: "#00D4AA",
    bgColor: "#00D4AA20",
    order: 2,
  },
  closed_won: {
    label: "已成交",
    color: "#22C55E",
    bgColor: "#22C55E20",
    order: 3,
  },
  closed_lost: {
    label: "已流失",
    color: "#EF4444",
    bgColor: "#EF444420",
    order: 4,
  },
};

const STORAGE_KEY = "scalebox_customers";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setCustomers(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load customers", e);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomers = async (list: Customer[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setCustomers(list);
    } catch (e) {
      console.error("Failed to save customers", e);
    }
  };

  const addCustomer = useCallback(
    async (data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "followUps">) => {
      const newCustomer: Customer = {
        ...data,
        id: Date.now().toString(),
        followUps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newCustomer, ...customers];
      await saveCustomers(updated);
      return newCustomer;
    },
    [customers],
  );

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Omit<Customer, "id" | "createdAt">>) => {
      const updated = customers.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c,
      );
      await saveCustomers(updated);
    },
    [customers],
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      const updated = customers.filter((c) => c.id !== id);
      await saveCustomers(updated);
    },
    [customers],
  );

  const addFollowUp = useCallback(
    async (customerId: string, record: Omit<FollowUpRecord, "id" | "date">) => {
      const newRecord: FollowUpRecord = {
        ...record,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      const updated = customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              followUps: [newRecord, ...c.followUps],
              updatedAt: new Date().toISOString(),
            }
          : c,
      );
      await saveCustomers(updated);
    },
    [customers],
  );

  const updateStage = useCallback(
    async (id: string, stage: CustomerStage) => {
      await updateCustomer(id, { stage });
    },
    [updateCustomer],
  );

  const getCustomerById = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers],
  );

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addFollowUp,
    updateStage,
    getCustomerById,
  };
}
