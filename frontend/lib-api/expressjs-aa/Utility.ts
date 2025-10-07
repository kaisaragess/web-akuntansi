export namespace Utility {
  export class ErrorParam<T> {
    public code: number = 500;
    public message?: string
    public data!: T
  }
}
