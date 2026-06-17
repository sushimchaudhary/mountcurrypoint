"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { ProjectsServices } from "@/services/projectsServices";
import ProjectCardSkeleton from "./ProjectCardSkelton";

interface Project {
  id: number;
  image: string;
  title: string;
  description: string;
}

export default function ProjectsPreview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await ProjectsServices.getDetails();
        // Show only first 6 on landing page
        setProjects(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <section className="max-w-7xl mx-auto md:px-12 px-4 py-12">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
            What We've Built
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">
            Featured Projects
          </h2>
        </div>
        <Link
          href="/projects"
          className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* Loading */}
      {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

      {/* Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}

      {/* Mobile "View All" button */}
      {!loading && projects.length > 0 && (
        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/projects"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors shadow-md shadow-green-200"
          >
            View All Projects <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}