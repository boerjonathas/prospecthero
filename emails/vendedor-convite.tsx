import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VendedorConviteEmailProps {
    nomeVendedor: string;
    emailVendedor: string;
    senhaTemporaria: string;
    loginUrl: string;
}

export const VendedorConviteEmail = ({
    nomeVendedor = "Herói",
    emailVendedor = "vendedor@email.com",
    senhaTemporaria = "123456",
    loginUrl = "http://localhost:3000/login",
}: VendedorConviteEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Bem-vindo ao time ProspectHero, {nomeVendedor}!</Preview>
            <Tailwind>
                <Body className="bg-slate-50 font-sans">
                    <Container className="mx-auto py-8 px-4 max-w-xl">
                        <Section className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                            <Heading className="text-3xl font-black text-slate-800 mb-4">
                                ProspectHero <span className="text-purple-600">🚀</span>
                            </Heading>

                            <Text className="text-lg text-slate-600 font-medium">
                                Olá, <span className="font-bold text-slate-800">{nomeVendedor}</span>!
                            </Text>

                            <Text className="text-slate-600 mb-6">
                                Você foi convidado para se juntar à nossa equipe de vendas. A partir de agora, você terá acesso a todas as ferramentas do
                                <span className="font-bold"> ProspectHero</span> para gerenciar seus leads e bater suas metas!
                            </Text>

                            <Section className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
                                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Suas Credenciais de Acesso</Text>
                                <Text className="text-slate-700 m-0"><strong>E-mail:</strong> {emailVendedor}</Text>
                                <Text className="text-slate-700 m-0"><strong>Senha Temporária:</strong> <code className="bg-slate-200 px-1 rounded">{senhaTemporaria}</code></Text>
                                <Text className="text-xs text-slate-400 mt-4 italic">* Recomendamos alterar sua senha após o primeiro acesso.</Text>
                            </Section>

                            <Button
                                className="bg-purple-600 text-white font-bold py-4 px-8 rounded-2xl text-center block w-full shadow-lg shadow-purple-200 hover:bg-purple-700"
                                href={loginUrl}
                            >
                                Acessar Minha Conta
                            </Button>

                            <Hr className="border-slate-100 my-8" />

                            <Text className="text-xs text-slate-400 text-center">
                                Este é um convite automático enviado pelo sistema de gestão ProspectHero.
                                Se você não reconhece este e-mail, por favor desconsidere-o.
                            </Text>
                        </Section>

                        <Text className="text-xs text-slate-300 text-center mt-4 uppercase font-bold tracking-widest">
                            ProspectHero &copy; 2026 - O Futuro da Prospecção
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default VendedorConviteEmail;
