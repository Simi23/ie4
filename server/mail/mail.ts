import { sendMail } from "./sender";

import nunjucks from "nunjucks";
import mjml2html from "mjml";

const templates = useStorage("templates");

async function loadTemplate(templateName: string) {
  const template = String(await templates.getItem(templateName));
  return template;
}

function renderTemplateVars(
  templateString: string,
  variables: Record<string, string>,
) {
  const renderedVars = nunjucks.renderString(templateString, variables);

  return renderedVars;
}

function renderTemplateMjml(templateString: string) {
  return mjml2html(templateString).html;
}

export async function testMail(recipient: string) {
  const template = await loadTemplate("Test.mjml");
  const html = renderTemplateMjml(template);

  await sendMail(recipient, "Teszt - Infósok Éjszakája", html);
}

export async function newSeatMail(recipient: string, newSeat: string) {
  const template = await loadTemplate("NewSeat.mjml");
  const vars = renderTemplateVars(template, {
    newSeat: newSeat,
  });
  const html = renderTemplateMjml(vars);

  await sendMail(recipient, "Átültetés - Infósok Éjszakája", html);
}

export async function lastCallMail(
  recipient: string,
  seat: string,
  openTime: string,
  startTime: string,
) {
  const template = await loadTemplate("MailBefore.mjml");
  const vars = renderTemplateVars(template, {
    openTime: openTime,
    startTime: startTime,
    seat: seat,
  });
  const html = renderTemplateMjml(vars);

  await sendMail(recipient, "Holnap Infósok Éjszakája!", html);
}

export async function registerMail(recipient: string, emailVerifyLink: string) {
  const template = await loadTemplate("Register.mjml");
  const vars = renderTemplateVars(template, {
    emailVerifyLink: emailVerifyLink,
  });
  const html = renderTemplateMjml(vars);

  await sendMail(recipient, "Email megerősítése - Infósok Éjszakája", html);
}

export async function passwordResetMail(
  recipient: string,
  passwordResetLink: string,
) {
  const template = await loadTemplate("PasswordReset.mjml");
  const vars = renderTemplateVars(template, {
    passwordChangeLink: passwordResetLink,
  });
  const html = renderTemplateMjml(vars);

  await sendMail(recipient, "Jelszó visszaállítása - Infósok Éjszakája", html);
}

export async function unfullTeamMail(recipient: string, closeTime: string) {
  const template = await loadTemplate("UnfullTeam.mjml");
  const vars = renderTemplateVars(template, {
    closeTime,
  });
  const html = renderTemplateMjml(vars);

  await sendMail(recipient, "Fontos teendő - Infósok Éjszakája", html);
}
