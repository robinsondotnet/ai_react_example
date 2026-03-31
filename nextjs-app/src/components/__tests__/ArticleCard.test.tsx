import { render, screen } from "@testing-library/react";
import { ArticleCard } from "../ArticleCard";
import type { ArticleModel } from "@/lib/aem/types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const article: ArticleModel = {
  _path: "/content/dam/demo/articles/test-article",
  title: "Test Article Title",
  body: { html: "<p>Test body HTML</p>", plaintext: "Test body plaintext" },
  author: "Jane Doe",
  publishDate: "2024-06-15",
  tags: ["react", "testing"],
};

describe("ArticleCard", () => {
  it("renders the article title", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  it("title is a link with correct href", () => {
    render(<ArticleCard article={article} />);
    const link = screen.getByRole("link", { name: "Test Article Title" });
    expect(link).toHaveAttribute(
      "href",
      `/articles/${encodeURIComponent(article._path)}`
    );
  });

  it("renders author name", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });

  it("renders formatted publish date", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument();
  });

  it("renders plaintext body excerpt", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText("Test body plaintext")).toBeInTheDocument();
  });

  it("renders tag badges", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
  });

  it("handles missing tags without crashing", () => {
    const noTags = { ...article, tags: undefined };
    const { container } = render(<ArticleCard article={noTags} />);
    expect(container.querySelector("article")).toBeInTheDocument();
    expect(screen.queryByText("react")).not.toBeInTheDocument();
  });

  it("handles missing publish date gracefully", () => {
    const noDate = { ...article, publishDate: "" };
    render(<ArticleCard article={noDate} />);
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.queryByText(/June/)).not.toBeInTheDocument();
  });
});
