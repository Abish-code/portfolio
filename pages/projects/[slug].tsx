import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import NextImage from "next/image";
import { ProjectForProjectPage, SkillForProjectPage } from "types/directus";

import IconMaker from "@/components/Shared/Icons/IconMaker";
import Tooltip from "@/components/Shared/Tooltip";
import getPreviewImageUrl from "@/utils/getPreviewImageURL";

import directus from "lib/directus";
import Link from "@/components/Shared/Link";

interface ProjectPageProps {
  project: ProjectForProjectPage;
  skillsUsed: SkillForProjectPage[];
}

const SkillPage: NextPage<ProjectPageProps> = ({ project, skillsUsed }) => {
  console.log(skillsUsed);
  return (
    <>
      <div className="mt-8 flex space-x-8">
        <IconMaker
          svgCode={project.iconSVG}
          className="shadow-md h-16 w-16 rounded-xl bg-tertiary p-2"
        />
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-300">{project.description}</p>
        </div>
      </div>
      <Link href={project.link} className="mt-4 md:mt-6" />

      <div className="my-6 flex space-x-4">
        {skillsUsed.map(skill => (
          <Tooltip key={skill.id} content={skill.name}>
            <Link href={`/skills/${skill.slug}`}>
                <IconMaker
                  svgCode={skill.iconSVG}
                  className="shadow-md h-8 w-8 rounded-lg bg-tertiary p-1 md:h-12 md:w-12 md:p-2"
                  aria-label={skill.name}
                />
            </Link>
          </Tooltip>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl">
        <NextImage
          width={project.image.width}
          height={project.image.height}
          src={project.image.url}
          className="rounded-xl drop-shadow-md"
          placeholder="blur"
          blurDataURL={project.image.previewURL}
        />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data } = await directus.items("projects").readByQuery({
    filter: { slug: params.slug as string },
    fields:
      "name, description, link, githubLink, iconSVG, image.url, image.height, image.width",
  });

  data[0].image.previewURL = await getPreviewImageUrl(data[0].image.url);

  const { data: skillsUsed } = await directus
    .items("projects_skills")
    .readByQuery({
      filter: { projects_id: { slug: params.slug as string } },
      fields: "skills_id.name, skills_id.slug, skills_id.iconSVG, skills_id.id",
    });

  return {
    props: {
      project: data[0],
      skillsUsed: skillsUsed.map(skill => {
        return { ...skill.skills_id };
      }),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await directus.items("projects").readByQuery({
    fields: "slug",
  });

  const paths = data.map(project => {
    return {
      params: {
        slug: project.slug,
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export default SkillPage;
