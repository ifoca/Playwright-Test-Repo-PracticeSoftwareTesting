import { mergeExpects, mergeTests } from '@playwright/test';
import { test as apiTest, expect as apiExpect } from '@fixtures/requests.fixture';
import { test as pageTest, expect as pageExpect } from '@fixtures/pages.fixture';
import { test as interceptTest, expect as interceptExpect } from '@fixtures/intercepts.fixture';

export const test = mergeTests(apiTest, pageTest, interceptTest);
export const expect = mergeExpects(apiExpect, pageExpect, interceptExpect);
