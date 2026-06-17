"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { ProjectsServices } from "@/services/projectsServices";
import ProjectCardSkeleton from "@/components/ProjectCardSkelton";

interface Project {
  id: number;
  image: string;
  title: string;
  description: string;
}

const ITEMS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await ProjectsServices.getDetails();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(ProjectsServices.parseError(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Hero Banner ── */}
      <section className="py-16 bg-gray-800 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
        <div className="flex items-center justify-center gap-2 text-sm md:text-base">
          <Link href="/" className="hover:text-green-400 cursor-pointer">
            Home
          </Link>
          <span>/</span>
          <span className="text-green-500 font-semibold">Projects</span>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="md:px-12 px-4 py-12">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
            What We've Built
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">
            Featured Projects
          </h2>
          <div className="mt-3 w-14 h-1 bg-green-500 rounded-full" />
        </motion.div>

      {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-medium">
            No projects found.
          </div>
        )}

        {/* Grid — 6 per page */}
        {!loading && !error && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Prev */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                        currentPage === page
                          ? "bg-green-600 text-white shadow-md shadow-green-200"
                          : "border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Page info */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, projects.length)} of{" "}
              {projects.length} projects
            </p>
          </>
        )}
      </section>
    </div>
  );
}