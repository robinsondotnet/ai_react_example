import { render, screen, fireEvent } from "@testing-library/react";
import { AEMErrorAlert } from "../AEMErrorAlert";
import { AEMRequestError } from "@/lib/aem/errors";
import type { AEMErrorCode } from "@/lib/aem/errors";

describe("AEMErrorAlert", () => {
  describe("with AEMRequestError", () => {
    it("shows 'Cannot reach AEM' for network errors", () => {
      const err = new AEMRequestError(
        "fetch failed",
        "network",
        undefined,
        undefined,
        "Connection was refused"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("Cannot reach AEM")).toBeInTheDocument();
      expect(screen.getByText("Connection was refused")).toBeInTheDocument();
    });

    it("shows 'Authentication failed' for unauthorized errors", () => {
      const err = new AEMRequestError(
        "HTTP 401 Unauthorized",
        "unauthorized",
        401,
        "http://localhost:4502/graphql",
        "Credentials rejected"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });

    it("shows 'Content not found' for not_found errors", () => {
      const err = new AEMRequestError(
        "HTTP 404 Not Found",
        "not_found",
        404,
        "http://localhost:4502/graphql",
        "Resource missing"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("Content not found")).toBeInTheDocument();
    });

    it("shows 'AEM server error' for server errors", () => {
      const err = new AEMRequestError(
        "HTTP 500 Server Error",
        "server",
        500,
        undefined,
        "Internal server error"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("AEM server error")).toBeInTheDocument();
    });

    it("shows 'Something went wrong' for unknown errors", () => {
      const err = new AEMRequestError(
        "HTTP 418",
        "unknown",
        418,
        undefined,
        "Unexpected status"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("displays the HTTP status badge", () => {
      const err = new AEMRequestError(
        "HTTP 401 Unauthorized",
        "unauthorized",
        401,
        undefined,
        "Credentials rejected"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("401")).toBeInTheDocument();
    });
  });

  describe("with plain Error", () => {
    it("renders with 'Something went wrong' title", () => {
      const err = new Error("Something unexpected");
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Something unexpected")).toBeInTheDocument();
    });
  });

  describe("with string error", () => {
    it("renders the string message", () => {
      render(<AEMErrorAlert error="A simple error message" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("A simple error message")).toBeInTheDocument();
    });
  });

  describe("retry button", () => {
    it("shows retry button when onRetry is provided", () => {
      const onRetry = vi.fn();
      render(
        <AEMErrorAlert error={new Error("fail")} onRetry={onRetry} />
      );
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      const onRetry = vi.fn();
      render(
        <AEMErrorAlert error={new Error("fail")} onRetry={onRetry} />
      );
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("hides retry button when onRetry is not provided", () => {
      render(<AEMErrorAlert error={new Error("fail")} />);
      expect(
        screen.queryByRole("button", { name: /try again/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("technical details", () => {
    it("shows URL in technical details when present", () => {
      const err = new AEMRequestError(
        "HTTP 404 Not Found",
        "not_found",
        404,
        "http://localhost:4502/graphql/execute.json/demo/all-articles",
        "Resource missing"
      );
      render(<AEMErrorAlert error={err} />);
      expect(screen.getByText("Technical details")).toBeInTheDocument();
      expect(
        screen.getByText(
          "http://localhost:4502/graphql/execute.json/demo/all-articles"
        )
      ).toBeInTheDocument();
    });
  });
});
