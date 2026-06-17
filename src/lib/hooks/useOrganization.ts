// lib/hooks/useOrganization.ts
"use client";

import { OrganizationServices } from "@/services/organizationServices";
import { useState, useEffect } from "react";

export interface Organization {
  id: number;
  logo: string;
  title: string;
  address: string;
  email1: string;
  email2: string;
  website: string;
  description: string;
  contactNo: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkdin_url: string;
  location_url: string;
  telephone_number: string;
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrg() {
      try {
        setLoading(true);
        const data = await OrganizationServices.getDetails();
        if (!cancelled) {
          // API returns an array; pick first item
          const org = Array.isArray(data) ? data[0] : data;
          setOrganization(org ?? null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(OrganizationServices.parseError(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrg();
    return () => { cancelled = true; };
  }, []);

  return { organization, loading, error };
}