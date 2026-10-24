import { prisma } from "../../db/index.js";

export function listSettingsByKeys(keys: string[]) {
  return prisma.appSetting.findMany({ where: { key: { in: keys } } });
}

export function listAllSettings() {
  return prisma.appSetting.findMany({ orderBy: { key: "asc" } });
}

export async function upsertSettings(entries: { key: string; value: string }[]) {
  await prisma.$transaction(
    entries.map((entry) =>
      prisma.appSetting.upsert({
        where: { key: entry.key },
        create: { key: entry.key, value: entry.value },
        update: { value: entry.value },
      }),
    ),
  );
  return listSettingsByKeys(entries.map((e) => e.key));
}
