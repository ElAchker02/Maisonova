const whatsappSvg = <img src="/whatsapp.svg" alt="WhatsApp" className="h-7 w-7" />;

export const WhatsAppButton = () => {
  const phoneNumber = "33123456789";
  const message = encodeURIComponent("Bonjour, je souhaite avoir des informations sur vos produits.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
      aria-label="Contacter via WhatsApp"
    >
      {whatsappSvg}
    </a>
  );
};
