import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';
import { env } from './env';

const client = new MercadoPagoConfig({
  accessToken: env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const preApproval = new PreApproval(client);
const payment = new Payment(client);

// Wrapper to make it easy to mock in tests
export const mp = {
  preApproval: {
    create: async (body: any) => preApproval.create({ body }),
    update: async (id: string, body: any) => preApproval.update({ id, body }),
    get: async (id: string) => preApproval.get({ id }),
  },
  payment: {
    create: async (body: any) => payment.create({ body }),
    get: async (id: string) => payment.get({ id }),
  }
};
