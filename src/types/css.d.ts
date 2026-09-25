declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
