export interface AIProvider {
  generateResponse(
    messages: { role: string; content: string }[],
    options?: any,
  ): Promise<string>;
}