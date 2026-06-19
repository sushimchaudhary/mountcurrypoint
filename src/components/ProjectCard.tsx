"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

interface Project {
  id: number;
  image: string;
  title: string;
  description: string;
  url?: string | null;
}

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="relative w-full h-56 overflow-hidden  p-2">
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
            className="object-center "
          />
        </div>
        {/* Hover Overlay */}
        <div className="absolute inset-2 rounded-xl bg-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-32">
        <h3 className="text-xl font-bold text-blue-950 mb-1 line-clamp-1 group-hover:text-green-700 transition-colors duration-200">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-grow">
          <div
            className="
    prose prose-sm max-w-none text-justify
    [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-[15px] [&_p]:text-gray-600
    [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1
    [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1
    [&_li]:text-gray-600 [&_li]:text-[15px]
    [&_h4]:font-bold [&_h4]:text-blue-900 [&_h4]:mb-2 [&_h4]:mt-4
    [&_b]:text-gray-800 [&_strong]:text-gray-800
    [&_i]:italic [&_em]:italic
  "
            dangerouslySetInnerHTML={{ __html: project.description ?? "" }}
          />
        </p>

        {/* Buttons Container */}
        <div className="flex justify-between items-center mt-2">
          <Link
            // Title लाई URL-friendly बनाउन encodeURIComponent प्रयोग गर्नुहोस्
            href={`/projects/${encodeURIComponent(project.title.toLowerCase().replace(/\s+/g, "-"))}`}
            className="text-sm font-bold text-blue-600 hover:underline transition-colors"
          >
            See More
          </Link>

          {/* View Link (External) */}
          {project.url && (
            <a
              href={
                project.url.startsWith("http")
                  ? project.url
                  : `https://${project.url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-green-600 hover:underline transition-colors"
            >
              View Link →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
