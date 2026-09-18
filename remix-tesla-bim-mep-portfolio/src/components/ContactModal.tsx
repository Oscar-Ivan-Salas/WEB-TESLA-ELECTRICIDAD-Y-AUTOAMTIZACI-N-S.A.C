import React, { useState } from 'react';
import { X, Send, Calculator, CheckCircle2, ShieldCheck, FileCheck, PhoneCall, Mail, Building } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    area: '5000',
    buildingType: 'Industrial',
    specs: {
      elec: true,
      san: true,
      hvac: true,
      auto: true,
    },
    message: ''
  });

  if (!isOpen) return null;

  const WHATSAPP_NUMBER = '51906315961';

  const buildWhatsAppMessage = () => {
    const specsActive = [
      formData.specs.elec && 'Eléctrica',
      formData.specs.san && 'Sanitaria / ACI',
      formData.specs.hvac && 'HVAC',
      formData.specs.auto && 'BMS / Control',
    ].filter(Boolean).join(', ');

    const lines = [
      'Hola TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C., les escribo desde el portafolio web para solicitar una cotización de Coordinación BIM MEP:',
      '',
      `*Nombre:* ${formData.name}`,
      `*Empresa:* ${formData.company}`,
      `*Correo:* ${formData.email}`,
      `*Teléfono:* ${formData.phone}`,
      `*Área aproximada:* ${formData.area} m²`,
      `*Tipo de edificación:* ${formData.buildingType}`,
      `*Especialidades a coordinar:* ${specsActive || 'Por definir'}`,
      formData.message ? `*Notas:* ${formData.message}` : '',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsApp();
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F17] border border-[#1E293B] max-w-2xl w-full p-6 md:p-8 space-y-6 relative rounded-xs active-glow max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={resetForm}
          className="absolute top-4 right-4 p-2 bg-[#161f2e] text-[#849396] hover:text-white border border-[#1E293B]"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2 border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFB800]/20 text-[#FFB800] font-code text-[10px] font-bold px-2 py-0.5 border border-[#FFB800]/40">
                  SOLICITUD DE COTIZACIÓN
                </span>
                <span className="font-code text-xs text-[#E63946] font-semibold">RESPUESTA EN &lt; 4 HORAS</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                Coordinación BIM MEP ISO 19650
              </h3>
              <p className="font-body text-xs text-[#bac9cc]">
                Suministre los detalles de su proyecto para recibir una propuesta técnica con cronograma y estimación de ahorro.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-code text-xs">
              <div>
                <label className="text-[#849396] uppercase block mb-1">Nombre Completo *</label>
                <input
                  required
                  type="text"
                  placeholder="Ing. Carlos Mendoza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[#849396] uppercase block mb-1">Empresa / Constructora *</label>
                <input
                  required
                  type="text"
                  placeholder="Constructora Andina S.A."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[#849396] uppercase block mb-1">Correo Corporativo *</label>
                <input
                  required
                  type="email"
                  placeholder="cmendoza@constructora.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[#849396] uppercase block mb-1">Teléfono / WhatsApp *</label>
                <input
                  required
                  type="tel"
                  placeholder="+51 987 654 321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[#849396] uppercase block mb-1">Área Aproximada (m²)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[#849396] uppercase block mb-1">Tipo de Edificación</label>
                <select
                  value={formData.buildingType}
                  onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
                >
                  <option value="Industrial">Industrial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Hospitalario">Hospitalario / Salud</option>
                  <option value="Residencial">Residencial / Torres</option>
                  <option value="Infraestructura">Infraestructura Data Center</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 font-code text-xs">
              <label className="text-[#849396] uppercase block">Especialidades a Coordinar:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 bg-[#0B0F17] p-2.5 border border-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specs.elec}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, elec: e.target.checked } })}
                    className="accent-[#FFB800]"
                  />
                  <span>Eléctrica</span>
                </label>
                <label className="flex items-center gap-2 bg-[#0B0F17] p-2.5 border border-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specs.san}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, san: e.target.checked } })}
                    className="accent-[#FFB800]"
                  />
                  <span>Sanitaria / ACI</span>
                </label>
                <label className="flex items-center gap-2 bg-[#0B0F17] p-2.5 border border-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specs.hvac}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, hvac: e.target.checked } })}
                    className="accent-[#FFB800]"
                  />
                  <span>HVAC</span>
                </label>
                <label className="flex items-center gap-2 bg-[#0B0F17] p-2.5 border border-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specs.auto}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, auto: e.target.checked } })}
                    className="accent-[#FFB800]"
                  />
                  <span>BMS / Control</span>
                </label>
              </div>
            </div>

            <div className="font-code text-xs">
              <label className="text-[#849396] uppercase block mb-1">Notas Adicionales del Proyecto:</label>
              <textarea
                rows={3}
                placeholder="Indique si ya cuenta con planos arquitectónicos en DWG/Revit o requisitos específicos de obra..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-[#FFB800] p-3 text-white outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#E63946] hover:bg-[#d92c39] text-white font-display font-black text-sm uppercase tracking-wider py-4 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.4)]"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Solicitud a Ingeniería TESLA</span>
            </button>

          </form>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#FFB800]/20 border-2 border-[#FFB800] text-[#FFB800] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-white">
                ¡Solicitud Registrada Exitosamente!
              </h3>
              <p className="font-body text-sm text-[#bac9cc] max-w-md mx-auto">
                Gracias, <span className="text-[#FFB800] font-semibold">{formData.name}</span>. Si WhatsApp no se abrió automáticamente, usa el botón de abajo para enviarnos su solicitud por WhatsApp.
              </p>
            </div>

            <div className="bg-[#0B0F17] p-4 border border-[#1E293B] max-w-md mx-auto font-code text-xs text-left space-y-2">
              <div className="text-[#FFB800] font-bold">RESUMEN REGISTRADO:</div>
              <div className="text-[#bac9cc]">Empresa: {formData.company}</div>
              <div className="text-[#bac9cc]">Edificación: {formData.buildingType} ({formData.area} m²)</div>
              <div className="text-[#E63946] font-semibold">Atención Prioritaria ISO 19650</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openWhatsApp}
                className="bg-[#25D366] hover:bg-[#1EBE5A] text-white font-display font-bold text-xs uppercase px-8 py-3 tracking-wider flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Abrir WhatsApp
              </button>
              <button
                onClick={resetForm}
                className="bg-[#E63946] hover:bg-[#d92c39] text-white font-display font-bold text-xs uppercase px-8 py-3 tracking-wider"
              >
                Volver al Portafolio
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
