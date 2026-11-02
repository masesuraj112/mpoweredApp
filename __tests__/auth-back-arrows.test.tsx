// The sign-up and sign-in screens show only the platform back arrow, except at the start, on the
// "verified" slides and on account-check (docs/backend/sign-up-sign-in-plan.md, 4.6).
import { act } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import AuthLayout from '../app/(auth)/_layout';

jest.setTimeout(60000);

const stub = (label: string) => {
  const Screen = () => <Text>{label}</Text>;
  Screen.displayName = `Stub(${label})`;
  return Screen;
};
const routes = {
  '(auth)/_layout': AuthLayout,
  '(auth)/onboarding': stub('onboarding'),
  '(auth)/name': stub('name'),
  '(auth)/phone': stub('phone'),
  '(auth)/account-check': stub('account check'),
  '(auth)/verification-confirmation': stub('verified'),
};

type HeaderConfig = { hidden: boolean; hideBackButton: boolean; translucent: boolean; backTitleVisible: boolean };

/** The native header settings of the screen on top (the last one in the stack). */
function topHeader(): HeaderConfig {
  const found: HeaderConfig[] = [];
  const walk = (node: unknown): void => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(walk);
    const element = node as { type?: string; props?: HeaderConfig; children?: unknown };
    if (element.type === 'RNSScreenStackHeaderConfig' && element.props) found.push(element.props);
    walk(element.children);
  };
  walk(screen.toJSON());
  return found[found.length - 1];
}

async function open(path: string, label: string) {
  const { router } = require('expo-router');
  await act(async () => router.push(path));
  await screen.findByText(label);
}

describe('back arrows in the sign-up and sign-in flow', () => {
  it('has no header on the first screen', async () => {
    await renderRouter(routes, { initialUrl: '/onboarding' });
    await screen.findByText('onboarding');

    expect(topHeader().hidden).toBe(true);
  });

  it.each([
    ['/name', 'name'],
    ['/phone', 'phone'],
  ])('shows only a back arrow, over the screen, on %s', async (path, label) => {
    await renderRouter(routes, { initialUrl: '/onboarding' });
    await open(path, label);

    expect(topHeader()).toMatchObject({ hidden: false, hideBackButton: false, translucent: true, backTitleVisible: false });
  });

  it.each([
    ['/account-check', 'account check'],
    ['/verification-confirmation', 'verified'],
  ])('has no header on %s', async (path, label) => {
    await renderRouter(routes, { initialUrl: '/onboarding' });
    await open(path, label);

    expect(topHeader().hidden).toBe(true);
  });
});
