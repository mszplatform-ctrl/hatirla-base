const prisma = require('../prisma');

module.exports = {
  getAllPackages: () =>
    prisma.package.findMany({
      orderBy: { createdAt: 'desc' },
    }),

  getPackageById: (id) =>
    prisma.package.findUnique({
      where: { id: Number(id) },
    }),

  createPackage: (data) =>
    prisma.package.create({
      data,
    }),

  updatePackageStatus: (id, status) =>
    prisma.package.update({
      where: { id: Number(id) },
      data: { status },
    }),
};
