import React, { useState, useEffect } from 'react';
import { X, Bike, CheckCircle, ShieldCheck } from 'lucide-react';
import { DeliveryPartner, DeliveryZone } from '../../../types';

interface RiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  rider?: DeliveryPartner | null;
  zones: DeliveryZone[];
}

export const RiderModal: React.FC<RiderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  rider,
  zones,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('rider123');
  const [avatar, setAvatar] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [status, setStatus] = useState<DeliveryPartner['status']>('approved');
  const [isOnline, setIsOnline] = useState(true);

  // KYC
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('1998-05-12');
  const [vehicleType, setVehicleType] = useState<DeliveryPartner['kyc']['vehicleType']>('Motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [payoutUpiOrBank, setPayoutUpiOrBank] = useState('');

  useEffect(() => {
    if (rider && mode === 'edit') {
      setName(rider.name);
      setPhone(rider.phone);
      setEmail(rider.email);
      setPassword(rider.password || 'rider123');
      setAvatar(rider.avatar);
      setZoneId(rider.zoneId);
      setStatus(rider.status);
      setIsOnline(rider.isOnline);

      setFatherName(rider.kyc.fatherName || '');
      setDob(rider.kyc.dob || '1998-05-12');
      setVehicleType(rider.kyc.vehicleType || 'Motorcycle');
      setVehicleNumber(rider.kyc.vehicleNumber || '');
      setDrivingLicenseNumber(rider.kyc.drivingLicenseNumber || '');
      setAadhaarNumber(rider.kyc.aadhaarNumber || '');
      setPanNumber(rider.kyc.panNumber || '');
      setPayoutUpiOrBank(rider.kyc.payoutUpiOrBank || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setAvatar('');
      setZoneId(zones[0]?.id || 'zone-1');
      setStatus('approved');
      setIsOnline(true);

      setFatherName('');
      setDob('');
      setVehicleType('Motorcycle');
      setVehicleNumber('');
      setDrivingLicenseNumber('');
      setAadhaarNumber('');
      setPanNumber('');
      setPayoutUpiOrBank('');
    }
  }, [rider, mode, isOpen, zones]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      phone,
      email,
      password,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      zoneId,
      status,
      isOnline,
      currentLocation: rider?.currentLocation || { lat: 12.9352, lng: 77.6245 },
      kyc: {
        fatherName,
        dob,
        vehicleType,
        vehicleNumber,
        rcNumber: rider?.kyc.rcNumber || vehicleNumber,
        rcDocUrl: rider?.kyc.rcDocUrl || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
        drivingLicenseNumber,
        dlDocUrl: rider?.kyc.dlDocUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
        aadhaarNumber,
        aadhaarDocUrl: rider?.kyc.aadhaarDocUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        panNumber,
        panDocUrl: rider?.kyc.panDocUrl || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
        selfieUrl: rider?.kyc.selfieUrl || avatar,
        payoutUpiOrBank,
        verified: status === 'approved',
      },
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Enrol Delivery Partner' : `Edit Rider: ${rider?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage fleet credentials, vehicle information, DL, Aadhaar & UPI settlement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Father's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 99887"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@likartfood.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Rider Login Password *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="rider123"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Zone *</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Vehicle Type *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Scooter">Scooter</option>
                <option value="Electric Bike">Electric Bike</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Vehicle Registration No (RC) *</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="KA-01-EQ-9182"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Driving License (DL) *</label>
              <input
                type="text"
                required
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                placeholder="DL-0420180012345"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Aadhaar Number (12-Digit) *</label>
              <input
                type="text"
                required
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234 5678 9012"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Payout UPI ID or Bank Details *</label>
              <input
                type="text"
                required
                value={payoutUpiOrBank}
                onChange={(e) => setPayoutUpiOrBank(e.target.value)}
                placeholder="rider@okaxis or Bank A/C"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Driver Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
              >
                <option value="approved">Approved & Active</option>
                <option value="pending">Pending KYC Verification</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Permanent Save Access Notice */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Permanent Save Access: Fleet profile & credentials securely committed to permanent storage.
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
              Secure
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Enrol Delivery Partner' : 'Update Partner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
