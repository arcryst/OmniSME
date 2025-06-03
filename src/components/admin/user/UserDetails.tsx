import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Key, Shield, UserCheck, Package, DollarSign } from 'lucide-react';
import { useUsers, useUpdateUser, useUserLicenses, useRemoveUserLicense } from '../../../hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { User, License } from '../../../types';
import { calculateMonthlyLicenseCost } from '../../../utils/license';

// ... rest of the file content from src/pages/admin/UserDetails.tsx ... 