import { License } from '../types';

export const calculateMonthlyLicenseCost = (licenses: License[]): number => {
  return licenses.reduce((total, license) => {
    if (license.status !== 'ACTIVE' || !license.software?.costPerLicense) {
      return total;
    }

    const cost = license.software.costPerLicense;
    const multiplier = license.software.billingCycle === 'YEARLY' ? 1/12 : 
                      license.software.billingCycle === 'ONE_TIME' ? 0 : 1;
    
    return total + (cost * multiplier);
  }, 0);
}; 