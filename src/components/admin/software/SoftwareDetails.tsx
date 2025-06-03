import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSoftwareById } from '../../../hooks/useSoftware';
import { useUpdateSoftware } from '../../../hooks/useAdmin';
import { Software } from '../../../types';
import { toast } from 'react-hot-toast';

// ... rest of the file content from src/pages/admin/SoftwareDetails.tsx ... 