"use client";

import { MapPin, Mail, Phone } from "lucide-react";
import { BsInstagram } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa6";
import { LiaLinkedin } from "react-icons/lia";
import Link from "next/link";
import { MdPhoneInTalk, MdLocalPhone } from "react-icons/md";
import { useOrganization } from "@/lib/hooks/useOrganization";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function TopBar() {
  const { organization } = useOrganization();

  const SOCIAL_LINKS = [
    {
      label: "Facebook",
      href: organization?.facebook_url || "#",
      icon: <FaFacebook className="w-3 h-3" />,
    },
    {
      label: "Twitter / X",
      href: organization?.twitter_url || "#",
      icon: <TwitterIcon className="w-3 h-3" />,
    },
    {
      label: "LinkedIn",
      href: organization?.linkdin_url || "#",
      icon: <LiaLinkedin className="w-3 h-3" />,
    },
    {
      label: "Instagram",
      href: organization?.instagram_url || "#",
      icon: <BsInstagram className="w-3 h-3" />,
    },
  ];

  return (
    <div className="w-full bg-green-700 text-white text-[12px]">
      <div className="max-w-7xl mx-auto px-1 md:px-10 py-2 flex flex-wrap justify-between items-center gap-x-6 gap-y-2">

        {/* Left: address + email */}
       <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {/* Address */}
        <span className="flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3" />
          {organization?.address ?? "email"}
        </span>

        {[organization?.email1, organization?.email2].filter(Boolean).map((email, index) => (
          <Link
            key={index}
            href={`mailto:${email}`}
            className="flex items-center gap-1 transition-colors hover:underline shrink-0"
          >
            <Mail className="w-3 h-3" />
            {email}
          </Link>
        ))}
      </div>

        {/* Right: phone + social */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          
         <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {[
              { label: organization?.telephone_number, href: `tel:${organization?.telephone_number}`, Icon: MdPhoneInTalk },
              { label: organization?.contactNo, href: `tel:${organization?.contactNo}`, Icon: MdLocalPhone }
            ]
            .filter((item) => item.label)
            .map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors hover:underline shrink-0"
              >
                <item.Icon className="w-3.5 h-3.5" /> 
                {item.label}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((s) => (
              
              <a   key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
     
  );
}