"use client"

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import OrderCard from "@/components/orders/OrderCard";
import { Order, OrderStatus } from "@/types/order";
import { FiFilter, FiSearch} from "react-icons/fi";

