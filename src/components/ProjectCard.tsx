"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Project {
  id: number;
  image: string;
  title: string;
  description: string;
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
            className="object-cover "
          />
        </div>
        {/* Hover Overlay */}
        <div className="absolute inset-2 rounded-xl bg-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-950 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors duration-200">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      </div>
    </motion.div>
  );
}
