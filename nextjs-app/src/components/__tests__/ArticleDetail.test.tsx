import { render, screen } from "@testing-library/react";
import { ArticleDetail } from "../ArticleDetail";
import type { ArticleModel } from "@/lib/aem/types";

const article: ArticleModel = {
  _path: "/content/dam/demo/articles/detail-test",
  title: "Detail Test Article",
  body: {
    html: "<p>This is <strong>rich text</strong> content</p>",
    plaintext: "This is rich text content",
  },
  author: "John Smith",
  publishDate: "2024-09-20",
  tags: ["design", "ux"],
};

describe("ArticleDetail", () => {
  it("renders the title as a heading", () => {
    render(<ArticleDetail article={article} />);
    expect(
      screen.getByRole("heading", { name: "Detail Test Article" })
    ).toBeInTheDocument();
  });

  it("renders author and publish date", () => {
    render(<ArticleDetail article={article} />);
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
    expect(screen.getByText(/September 20, 2024/)).toBeInTheDocument();
  });

  it("renders HTML body via dangerouslySetInnerHTML", () => {
    render(<ArticleDetail article={article} />);
    expect(screen.getByText("rich text")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<ArticleDetail article={article} />);
    expect(screen.getByText("design")).toBeInTheDocument();
    expect(screen.getByText("ux")).toBeInTheDocument();
  });

  it("falls back to plaintext when body.html is empty", () => {
    const noHtml: ArticleModel = {
      ...article,
      body: { html: "", plaintext: "Plaintext fallback content" },
    };
    render(<ArticleDetail article={noHtml} />);
    expect(screen.getByText("Plaintext fallback content")).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const minimal: ArticleModel = {
      _path: "/content/dam/demo/articles/minimal",
      title: "Minimal Article",
      body: { html: "<p>body</p>", plaintext: "body" },
      author: "Author",
      publishDate: "",
    };
    const { container } = render(<ArticleDetail article={minimal} />);
    expect(container.querySelector("article")).toBeInTheDocument();
    expect(screen.queryByText(/design/)).not.toBeInTheDocument();
  });
});
