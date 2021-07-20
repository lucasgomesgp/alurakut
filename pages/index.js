import React from "react";
import nookies from "nookies";
import jwt from "jsonwebtoken";
import MainGrid from "../src/components/MainGrid";
import Box from "../src/components/Box";
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from "../src/lib/AlurakutCommons";
import { ProfileRelationsBoxWrapper } from "../src/components/ProfileRelations";

function ProfileSidebar(props) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${props.githubUser}.png`} style={{ borderRadius: "8px" }} />
      <hr />
      <p>
        <a className="boxLink" href={`https://github.com/${props.githubUser}`}>
          @{props.githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  );
}

function ProfileRelationsBox(props) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {props.title} ({props.items.length})
      </h2>
      <ul>
        {/* {followers.map((currentItem) => {
          return (
            <li key={currentItem.id}>
              <a href={`https://github.com/${currentItem.title}.png`}>
                <img src={currentItem.image} />
                <span>{currentItem.title}</span>
              </a>
            </li>
          );
        })} */}
      </ul>
    </ProfileRelationsBoxWrapper>
  );
}

export default function Home(props) {
  const randomUser = props.githubUser;
  const favPeople = ['juunegreiros', 'omariosouto', 'peas', 'rafaballerini', 'marcobrunodev', 'felipefialho'];
  const [communities, setCommunities] = React.useState([]);
  const [followers, setFollowers] = React.useState([]);

  React.useEffect(function () {
    fetch("https://api.github.com/users/peas/followers").then(
      function (serverResponse) {
        return serverResponse.json();
      }).then(function (allResponse) {
        setFollowers(allResponse);
      });

    //API GraphQL
    fetch("https://graphql.datocms.com/", {
      method: 'POST',
      headers: {
        'Authorization': '7d4b631373e026fa8ccc4f5628b6a8',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "query": `query{
            allCommunities{
              id,
              title,
              imageUrl,
              creatorSlug,
              createdAt
            }
          }`})
    }).then((response) =>
      response.json()
    ).then((allResponse) => {
      const communitiesDato = allResponse.data.allCommunities;
      console.log(communitiesDato);
      setCommunities(communitiesDato);
    });

  }, []);

  return (
    <>
      <AlurakutMenu />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar githubUser={randomUser} />
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">
              Bem vindo(a)
            </h1>
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCreateComunnity(event) {
              event.preventDefault();
              const formData = new FormData(event.target);

              const community = {
                title: formData.get("title"),
                imageUrl: formData.get("image"),
                creatorSlug: randomUser,
              }
              fetch("/api/communities", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(community),
              })
                .then(async (response) => {
                  const data = await response.json();
                  console.log(data.record);
                  const communityRecord = data.record;
                  const newCommunities = [...communities, communityRecord];
                  setCommunities(newCommunities);
                });
            }}>
              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>
              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa"
                  name="image"
                  aria-label="Coloque uma URL para usarmos de capa"
                />
              </div>
              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          <ProfileRelationsBox title="Seguidores" items={followers} />
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({communities.length})
            </h2>
            <ul>
              {communities.map((currentItem) => {
                return (
                  <li key={currentItem.id}>
                    <a href={`/users/${currentItem.id}`}>
                      <img src={currentItem.imageUrl} />
                      <span>{currentItem.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Pessoas da comunidade ({favPeople.length})</h2>
            <ul>
              {favPeople.map((currentItem) => {
                return (
                  <li key={currentItem}>
                    <a href={`/users/${currentItem}`} key={currentItem}>
                      <img src={`https://github.com/${currentItem}.png`} />
                      <span>{currentItem}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  );
}
export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  const token = cookies.USER_TOKEN;
  
  const { isAuthenticated } = await fetch("https://alurakut.vercel.app/api/auth", {
    headers: {
      Authorization: token
    }
  })
  .then((response) => response.json());
  
  if(!isAuthenticated){
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }
  const { githubUser } = jwt.decode(token);

  return {
    props: {
      githubUser
    },
  }
}