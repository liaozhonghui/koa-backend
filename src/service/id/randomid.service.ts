interface IdGenerator {
  generate(): string;
}

interface LogTraceIdGenerator extends IdGenerator {}

class RandomIdGenerator implements LogTraceIdGenerator {
  generate(): string {
    return "1";
  }
}
