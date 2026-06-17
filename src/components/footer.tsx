"use client";

import { useOrganization } from "@/lib/hooks/useOrganization";
import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { MdPhoneInTalk, MdLocalPhone } from "react-icons/md";

const TwitterIcon = ({ size }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: size, height: size }}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const { organization } = useOrganization();

  const SOCIAL_LINKS = [
    {
      Icon: TwitterIcon,
      href: organization?.twitter_url || "#",
      label: "Twitter",
    },
    {
      Icon: FaFacebookF,
      href: organization?.facebook_url || "#",
      label: "Facebook",
    },
    {
      Icon: FaInstagram,
      href: organization?.instagram_url || "#",
      label: "Instagram",
    },
    {
      Icon: FaLinkedinIn,
      href: organization?.linkdin_url || "#",
      label: "LinkedIn",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <footer className="bg-[#007f35] text-white pt-16 pb-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {organization?.title ?? "Arya Tara Private Limited."}
            </h2>

            <div className="space-y-3 text-sm opacity-90">
              {/* Address */}
              <p className="flex items-start gap-2">
                <MapPin className="w-5 h-5 shrink-0" />
                {organization?.address ?? "Indrasarowar-5, Makawanpur, Nepal"}
              </p>

              {/* Phones */}
              {[
                { val: organization?.telephone_number, icon: MdPhoneInTalk }, 
  
              { val: organization?.contactNo, icon: MdLocalPhone },
              ]
                .filter((item) => item.val)
                .map((item, idx) => (
                  <p key={`phone-${idx}`} className="flex items-center gap-2">
                    <item.icon className="w-5 h-5 shrink-0" />
                    <Link href={`tel:${item.val}`} className="hover:underline">
                      {item.val}
                    </Link>
                  </p>
                ))}

              {/* Emails */}
              {[organization?.email1, organization?.email2]
                .filter(Boolean)
                .map((email, idx) => (
                  <p key={`email-${idx}`} className="flex items-center gap-2">
                    <Mail className="w-5 h-5 shrink-0" />
                    <Link href={`mailto:${email}`} className="hover:underline">
                      {email}
                    </Link>
                  </p>
                ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {["About Us", "Contact Us", "Teams"].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase().replace(" ", "-")}`}
                    className="hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    › {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services/mount-curry"
                  className="hover:pl-2 transition-all duration-300 flex items-center"
                >
                  › The Mount Curry Point
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Follow Us</h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-[#007f35] transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 text-center text-sm opacity-80">
          <p>
            © {new Date().getFullYear()}{" "}
            {organization?.title ?? "Arya Tara Pvt. Ltd."}. All Rights Reserved.
          </p>
          <p className="mt-2">
            Developed by
            <Link
              href="https://sempatech.com"
              className="ml-1 font-semibold hover:text-yellow-300 transition-colors"
            >
              Sempa Tech
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
