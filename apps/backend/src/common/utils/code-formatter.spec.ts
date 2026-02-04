import * as prettier from 'prettier';

import { CodeFormatter } from './code-formatter';

jest.mock('prettier');

describe('CodeFormatter', () => {
  let formatter: CodeFormatter;

  beforeEach(() => {
    formatter = new CodeFormatter();
    jest.clearAllMocks();
  });

  it('지원하지 않는 언어면 원문을 반환하고 prettier.format을 호출하지 않아야 한다', async () => {
    const code = 'print("hello")';

    const result = await formatter.format(code, 'python');

    expect(result).toBe(code);
    expect(prettier.format).not.toHaveBeenCalled();
  });

  it('지원하는 언어면 prettier.format을 호출하고 BLANK를 복구해야 한다', async () => {
    const code = 'const value = {{BLANK}};';
    const formattedCode = 'const value = quizblank;\n';

    (prettier.format as jest.Mock).mockResolvedValue(formattedCode);

    const result = await formatter.format(code, 'JavaScript');

    expect(prettier.format).toHaveBeenCalledWith(
      expect.stringContaining('quizblank'),
      expect.objectContaining({
        parser: 'babel',
      }),
    );
    expect(result).toBe('const value = {{BLANK}};');
  });

  it('언어가 비어 있으면 원문을 반환해야 한다', async () => {
    const code = 'const value = 1;';

    const result = await formatter.format(code, '   ');

    expect(result).toBe(code);
    expect(prettier.format).not.toHaveBeenCalled();
  });
});
