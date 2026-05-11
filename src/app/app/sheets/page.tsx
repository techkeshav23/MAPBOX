"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { fmtDateTime, nextId } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Folder, FileSpreadsheet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Sheet, SheetData } from "@/lib/types";

export default function SheetsPage() {
  const folders = useStore((s) => s.db.folders);
  const sheets = useStore((s) => s.db.sheets);
  const setDb = useStore((s) => s.setDb);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFolder, setActiveFolder] = useState("f-root");
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newSheetOpen, setNewSheetOpen] = useState(false);

  const folder = folders.find((f) => f.id === activeFolder)!;
  const subfolders = folders.filter((f) => f.parentId === activeFolder);
  const sheetsHere = sheets.filter((s) => s.folderId === activeFolder);

  function folderPath(f: typeof folder): string[] {
    const out: string[] = [];
    let cur: typeof folder | undefined = f;
    while (cur) {
      out.unshift(cur.name);
      cur = folders.find((x) => x.id === cur!.parentId);
    }
    return out;
  }

  async function importXlsx(file: File) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });
    const id = nextId("s");
    setDb((db) =>
      db.sheets.push({
        id, folderId: activeFolder, name: file.name,
        updatedAt: new Date().toISOString(),
        data: data.length ? data : [[""]],
      }),
    );
    toast.success(`Imported ${file.name}`);
    setOpenSheet(id);
  }

  function downloadSheet(s: Sheet) {
    const ws = XLSX.utils.aoa_to_sheet(s.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, s.name);
    toast.success(`Downloaded ${s.name}`);
  }

  return (
    <Card className="overflow-hidden p-0 gap-0" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="grid grid-cols-12 h-full">
        {/* Folders */}
        <div className="col-span-12 md:col-span-3 border-r border-border flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold">Drive</div>
            <Button variant="ghost" size="icon" onClick={() => setNewFolderOpen(true)} title="New folder">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <FolderTree
              parentId={null}
              depth={0}
              folders={folders}
              activeId={activeFolder}
              onPick={setActiveFolder}
            />
          </div>
        </div>

        {/* Files */}
        <div className="col-span-12 md:col-span-9 flex flex-col min-h-0">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-sm font-semibold">{folder.name}</div>
              <div className="text-xs text-muted-foreground">/{folderPath(folder).join(" / ")}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importXlsx(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Import xlsx</Button>
              <Button onClick={() => setNewSheetOpen(true)}><Plus className="w-4 h-4" /> New sheet</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {subfolders.length > 0 && (
              <div className="mb-6">
                <div className="text-[11px] uppercase font-bold text-muted-foreground mb-2">Folders</div>
                <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {subfolders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFolder(f.id)}
                      className="rounded-lg border border-border hover:border-wood-400 hover:bg-wood-50/30 p-3 text-left transition"
                    >
                      <div className="flex items-center gap-2 text-wood-700">
                        <Folder className="w-4 h-4" />
                        <div className="font-semibold text-sm truncate">{f.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {sheets.filter((s) => s.folderId === f.id).length} sheets
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sheetsHere.length > 0 && (
              <>
                <div className="text-[11px] uppercase font-bold text-muted-foreground mb-2">Spreadsheets</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sheetsHere.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-border hover:border-wood-400 transition p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{s.name}</div>
                          <div className="text-xs text-muted-foreground">Updated {fmtDateTime(s.updatedAt)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setOpenSheet(s.id)}>Open</Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadSheet(s)}>Download</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            if (!confirm(`Delete ${s.name}?`)) return;
                            setDb((db) => { db.sheets = db.sheets.filter((x) => x.id !== s.id); });
                            toast.success("Sheet deleted");
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {subfolders.length === 0 && sheetsHere.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                This folder is empty. Create a sheet or import an xlsx.
              </div>
            )}
          </div>
        </div>
      </div>

      {newFolderOpen && (
        <NewFolderDialog
          onClose={() => setNewFolderOpen(false)}
          onSave={(name) => {
            setDb((db) => db.folders.push({ id: nextId("f"), name, parentId: activeFolder }));
            setNewFolderOpen(false);
            toast.success("Folder created");
          }}
        />
      )}

      {newSheetOpen && (
        <NewSheetDialog
          onClose={() => setNewSheetOpen(false)}
          onSave={(name) => {
            const id = nextId("s");
            setDb((db) =>
              db.sheets.push({
                id,
                folderId: activeFolder,
                name: name.endsWith(".xlsx") ? name : `${name}.xlsx`,
                updatedAt: new Date().toISOString(),
                data: Array.from({ length: 8 }, () => Array(6).fill("")),
              }),
            );
            setNewSheetOpen(false);
            setOpenSheet(id);
          }}
        />
      )}

      {openSheet && <SheetEditor sheetId={openSheet} onClose={() => setOpenSheet(null)} onDownload={downloadSheet} />}
    </Card>
  );
}

function FolderTree({
  parentId, depth, folders, activeId, onPick,
}: {
  parentId: string | null;
  depth: number;
  folders: { id: string; name: string; parentId: string | null }[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  const children = folders.filter((f) => f.parentId === parentId);
  return (
    <>
      {children.map((f) => (
        <div key={f.id}>
          <button
            onClick={() => onPick(f.id)}
            className={cn(
              "flex items-center gap-2 px-2.5 py-2 rounded text-sm w-full text-left transition",
              f.id === activeId ? "bg-wood-50 text-wood-800 font-semibold" : "hover:bg-muted",
            )}
            style={{ paddingLeft: `${0.6 + depth * 0.7}rem` }}
          >
            <Folder className="w-4 h-4" />
            <span className="truncate">{f.name}</span>
          </button>
          <FolderTree parentId={f.id} depth={depth + 1} folders={folders} activeId={activeId} onPick={onPick} />
        </div>
      ))}
    </>
  );
}

function NewFolderDialog({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
        <div><Label>Folder name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => name && onSave(name)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewSheetDialog({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState("Untitled.xlsx");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>New spreadsheet</DialogTitle></DialogHeader>
        <div><Label>Sheet name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(name || "Untitled.xlsx")}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SheetEditor({
  sheetId, onClose, onDownload,
}: { sheetId: string; onClose: () => void; onDownload: (s: Sheet) => void }) {
  const sheet = useStore((s) => s.db.sheets.find((x) => x.id === sheetId));
  const setDb = useStore((s) => s.setDb);

  const [data, setData] = useState<SheetData>(() => {
    const init: SheetData = (sheet?.data ?? []).map((r) => [...r]);
    while (init.length < 8) init.push(Array(6).fill(""));
    const c = Math.max(6, ...init.map((r) => r.length));
    init.forEach((r) => { while (r.length < c) r.push(""); });
    return init;
  });

  if (!sheet) return null;

  function addRow() {
    setData((d) => [...d, Array(d[0].length).fill("")]);
  }
  function addCol() {
    setData((d) => d.map((r) => [...r, ""]));
  }
  function setCell(r: number, c: number, value: string) {
    setData((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  }
  function save() {
    setDb((db) => {
      const row = db.sheets.find((s) => s.id === sheetId);
      if (!row) return;
      row.data = data;
      row.updatedAt = new Date().toISOString();
    });
    toast.success("Sheet saved");
    onClose();
  }

  const cols = data[0]?.length ?? 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="!max-w-[96vw] w-[96vw] !h-[92vh] !max-h-[92vh] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <DialogTitle className="font-mono text-sm truncate">{sheet.name}</DialogTitle>
            <span className="text-[10px] mono text-muted-foreground whitespace-nowrap">
              · {data.length}r × {cols}c · saved {fmtDateTime(sheet.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={addRow} className="rounded-sm h-7 px-2">+ row</Button>
            <Button variant="ghost" size="sm" onClick={addCol} className="rounded-sm h-7 px-2">+ column</Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/30 min-w-0 min-h-0">
          <table className="border-collapse min-w-full">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="cell cell-head w-12">#</th>
                {Array.from({ length: cols }, (_, i) => (
                  <th key={i} className="cell cell-head">{colLetter(i)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, r) => (
                <tr key={r}>
                  <td className="cell cell-head w-12 sticky left-0 z-[5]">{r + 1}</td>
                  {row.map((c, ci) => (
                    <td key={ci}>
                      <div
                        className="cell"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setCell(r, ci, e.currentTarget.textContent ?? "")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            (e.currentTarget as HTMLDivElement).blur();
                          }
                        }}
                      >
                        {String(c ?? "")}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="px-4 py-3 border-t border-border bg-background flex-row sm:justify-between !gap-2">
          <div className="text-[11px] mono text-muted-foreground self-center">
            tab / arrows to navigate · enter to commit · scroll for more
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onDownload({ ...sheet, data })} className="rounded-sm">Download .xlsx</Button>
            <Button variant="outline" onClick={onClose} className="rounded-sm">Close</Button>
            <Button onClick={save} className="rounded-sm">Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function colLetter(n: number): string {
  let s = "";
  let x = n;
  while (true) {
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26) - 1;
    if (x < 0) break;
  }
  return s;
}
