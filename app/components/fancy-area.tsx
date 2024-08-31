import React, { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Bold, Italic, Link, Code, Undo, Redo } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FancyAreaProps } from "types";

export default function FancyArea(props: FancyAreaProps) {
  const [text, setText] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUndoStack((prev) => [...prev, text]);
    setRedoStack([]);
    setText(e.target.value);
  };

  const insertFormatting = useCallback(
    (startTag: string, endTag: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);

      const newText = beforeText + startTag + selectedText + endTag + afterText;
      setUndoStack((prev) => [...prev, text]);
      setRedoStack([]);
      setText(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + startTag.length,
          end + startTag.length
        );
      }, 0);
    },
    [text]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            insertFormatting("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertFormatting("*", "*");
            break;
          case "l":
            e.preventDefault();
            insertFormatting("[", "](url)");
            break;
          case ",":
            e.preventDefault();
            insertFormatting("`", "`");
            break;
          case "z":
            e.preventDefault();
            if (undoStack.length > 0) {
              const prevText = undoStack.pop()!;
              setRedoStack((prev) => [text, ...prev]);
              setText(prevText);
              setUndoStack([...undoStack]);
            }
            break;
          case "y":
            e.preventDefault();
            if (redoStack.length > 0) {
              const nextText = redoStack.shift()!;
              setUndoStack((prev) => [...prev, text]);
              setText(nextText);
              setRedoStack([...redoStack]);
            }
            break;
        }
      }
    },
    [insertFormatting, undoStack, redoStack, text]
  );

  const handleBold = () => insertFormatting("**", "**");
  const handleItalic = () => insertFormatting("*", "*");
  const handleLink = () => insertFormatting("[", "](url)");
  const handleCode = () => insertFormatting("`", "`");
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prevText = undoStack.pop()!;
      setRedoStack((prev) => [text, ...prev]);
      setText(prevText);
      setUndoStack([...undoStack]);
    }
  };
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextText = redoStack.shift()!;
      setUndoStack((prev) => [...prev, text]);
      setText(nextText);
      setRedoStack([...redoStack]);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-inherit border-none my-3 p-3 text-white">
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger
            value="write"
            className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            Write
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleBold}
              size="icon"
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleItalic}
              size="icon"
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleLink}
              size="icon"
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCode}
              size="icon"
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleUndo}
              size="icon"
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRedo}
              size="icon"
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Build by @mxkaske, _powered by_ @shadcn **ui**. Supports raw <code>html</code>."
            className={`min-h-[200px] bg-gray-800 text-white border-gray-700 placeholder-gray-500 w-full ${props.textAreaClassName}`}
            name={props.textAreaName}
            id={props.textAreaId}
            readOnly={props.textAreaReadOnly}
          />
          <p className="text-sm text-gray-400">
            Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+L (link),
            Ctrl+, (code), Ctrl+Z (undo), Ctrl+Y (redo)
          </p>
        </TabsContent>
        <TabsContent value="preview" className="p-4 bg-gray-800 rounded-sm">
          <div className="prose prose-invert max-w-none">
            {text ? (
              <ReactMarkdown>{text}</ReactMarkdown>
            ) : (
              <p className="text-gray-400">
                Tidak ada yang bisa dilihat disini &gt;_&lt;
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
