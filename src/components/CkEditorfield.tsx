"use client";

import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  Bold,
  Italic,
  Underline,
  Essentials,
  Heading,
  Image,
  ImageUpload,
  Link,
  List,
  Paragraph,
  Table,
  Undo,
  Alignment,
  WordCount,
  CKFinderUploadAdapter,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import { Type } from "lucide-react";

interface CKEditorFieldProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export default function CKEditorField({
  value,
  onChange,
  placeholder = "Start writing here...",
  height = 540,
  label,
  required = false,
  error,
}: CKEditorFieldProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  return (
    <div className="ckeditor-field-wrapper space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Type size={11} className="text-gray-300" />
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <div className="flex items-center gap-2 text-[10px] text-gray-300 tabular-nums">
            <span className="px-1.5 py-0.5 rounded bg-gray-50">
              {wordCount} words
            </span>
            <span className="text-gray-200">·</span>
            <span className="px-1.5 py-0.5 rounded bg-gray-50">
              {charCount} chars
            </span>
          </div>
        </div>
      )}

      <div
        className={`rounded overflow-hidden transition-all duration-200 ${
          error ? "border-red-500" : "border-[#E6E7E7]"
        } border`}
        style={{ "--ck-height": `${height}px` } as React.CSSProperties}
      >
        <CKEditor
          editor={ClassicEditor}
          data={value || ""}
          config={{
            licenseKey: "GPL",
            placeholder,
            plugins: [
              Essentials,
              Paragraph,
              Heading,
              Bold,
              Italic,
              Underline,
              Link,
              List,
              Image,
              ImageUpload,
              Table,
              Alignment,
              WordCount,
              CKFinderUploadAdapter,
              Undo,
            ],
            // ── Key fix: define each heading level explicitly ──────────────
            heading: {
              options: [
                {
                  model: "paragraph",
                  title: "Paragraph",
                  class: "ck-heading_paragraph",
                },
                {
                  model: "heading1",
                  view: "h1",
                  title: "Heading 1",
                  class: "ck-heading_heading1",
                },
                {
                  model: "heading2",
                  view: "h2",
                  title: "Heading 2",
                  class: "ck-heading_heading2",
                },
                {
                  model: "heading3",
                  view: "h3",
                  title: "Heading 3",
                  class: "ck-heading_heading3",
                },
              ],
            },
            // ─────────────────────────────────────────────────────────────
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "link",
              "|",
              "bulletedList",
              "numberedList",
              "alignment",
              "|",
              "uploadImage",
              "insertTable",
              "undo",
              "redo",
            ],
            ckfinder: {
              uploadUrl:
                "https://api.edifynepal.com/api/content/ckeditor/upload/",
            },
          }}
          onReady={(editor) => {
            const wordCountPlugin = editor.plugins.get("WordCount");
            wordCountPlugin.on("update", (evt: any, stats: any) => {
              setWordCount(stats.words);
              setCharCount(stats.characters);
            });
          }}
          onChange={(event: any, editor: any) => {
            const data = editor.getData();
            onChange(data);
          }}
        />
      </div>

      <style jsx global>{`
        .ck-editor__editable_inline {
          min-height: var(--ck-height);
          max-height: var(--ck-height);
          overflow-y: auto;
        }

        /* Heading styles visible inside the editor */
        .ck-editor__editable h1 {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 0.5rem 0;
          color: #1e293b;
        }
        .ck-editor__editable h2 {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.35;
          margin: 0.5rem 0;
          color: #1e293b;
        }
        .ck-editor__editable h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.5rem 0;
          color: #1e293b;
        }
        .ck-editor__editable p {
          margin: 0.25rem 0;
          line-height: 1.75;
        }
      `}</style>

      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1">
          <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center font-bold text-[8px]">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}