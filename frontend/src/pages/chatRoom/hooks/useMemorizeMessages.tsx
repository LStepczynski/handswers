import React from "react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const mainDivMaxWidthClasses =
  "max-w-[92vw] sm:max-w-[570px] md:max-w-[670px] lg:max-w-[900px] xl:max-w-[1100px]";

const markdownComponents = {
  code({ className, children, ...rest }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <div className={mainDivMaxWidthClasses}>
        <SyntaxHighlighter
          PreTag="div"
          language={match[1]}
          style={coldarkDark}
          {...rest}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code {...rest} className={`${className} bg-muted p-[0.2rem] rounded-md`}>
        {children}
      </code>
    );
  },
  p({ children }: any) {
    return <p className="leading-loose">{children}</p>;
  },
  ul({ children }: any) {
    return <ul className="list-disc pl-5 space-y-2">{children}</ul>;
  },
  ol({ children }: any) {
    return <ul className="list-decimal pl-5 space-y-1">{children}</ul>;
  },
  li({ children }: any) {
    return <li className="leading-loose">{children}</li>;
  },
  strong({ children }: any) {
    return (
      <strong className="font-semibold text-foreground">{children}</strong>
    );
  },
  em({ children }: any) {
    return <em className="italic text-muted-foreground">{children}</em>;
  },
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    );
  },
};

export const useMemorizeMessages = (messages: Record<string, any>[]) => {
  const renderedMessages = React.useMemo(() => {
    return messages.map((message: any, index: number) => {
      if (message.author == "user") {
        return (
          <div className="w-full my-8 flex justify-end" key={index}>
            <div className="bg-muted p-3 rounded-md mr-4">
              <p>{message.content}</p>
            </div>
          </div>
        );
      }

      return (
        <div className="grid gap-6 sm:mx-4 w-full" key={index}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    });
  }, [messages]);

  return renderedMessages;
};
