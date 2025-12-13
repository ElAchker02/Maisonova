const whatsappSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor">
    <path d="M16.004 5.083c-3.85 0-6.98 3.129-6.98 6.975 0 1.368.398 2.694 1.154 3.84l.179.278-1.196 4.372 4.477-1.175.268.158a6.93 6.93 0 0 0 3.994 1.217h.002c3.847 0 6.977-3.13 6.98-6.977.002-1.863-.723-3.614-2.038-4.934a6.96 6.96 0 0 0-4.944-2.034Zm0-2.083c5.003 0 9.067 4.057 9.055 9.058-.006 5.006-4.052 9.058-9.058 9.058a9.05 9.05 0 0 1-4.58-1.227l-6.42 1.685 1.716-6.29A9.06 9.06 0 0 1 6.95 8.06a9.05 9.05 0 0 1 6.94-3.06Zm4.789 12.54c-.266-.132-1.575-.778-1.82-.867-.245-.089-.424-.132-.603.133s-.692.867-.85 1.046c-.156.177-.31.2-.575.066-.266-.133-1.122-.414-2.137-1.32-.791-.704-1.325-1.573-1.48-1.838-.156-.266-.017-.41.117-.543.12-.119.266-.31.399-.465.134-.155.178-.266.266-.444.089-.178.044-.333-.022-.466-.067-.133-.602-1.447-.825-1.983-.217-.52-.438-.45-.603-.459-.156-.007-.333-.009-.512-.009-.177 0-.466.066-.71.333-.245.266-.934.91-.934 2.218s.958 2.575 1.092 2.753c.134.177 1.885 2.879 4.57 4.035.64.276 1.14.441 1.53.563.642.205 1.226.176 1.688.107.514-.076 1.575-.643 1.796-1.264.222-.622.222-1.155.155-1.264-.066-.11-.244-.177-.51-.31Z" />
  </svg>
);

export const WhatsAppButton = () => {
  const phoneNumber = "33123456789";
  const message = encodeURIComponent("Bonjour, je souhaite avoir des informations sur vos produits.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse-gold"
      aria-label="Contacter via WhatsApp"
    >
      {whatsappSvg}
    </a>
  );
};
