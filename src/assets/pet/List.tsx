import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import useInfiniteScroll from 'use-infinite-scroll';

import { CardColumns } from 'react-bootstrap';
import { Card } from '../../components/Card';
import { Pet as PetType, Status } from '../../types/pet';
import { findByStatus } from '../../resources/Pet';
import { SearchContext } from '../../App';
import { RandomDog } from '../../axios';

const pageSize = 10;

const List = () => {
	const { query } = useContext(SearchContext);
	const [pets, setPets] = useState<Array<PetType>>([]);
	const [filteredPets, setFilteredPets] = useState<Array<PetType>>([]);
	const [limit, setLimit] = useState<number>(pageSize);
	const [isFetching, setIsFetching] = useInfiniteScroll(() => {
		limit < pets.length ? setLimit(limit + pageSize) : setLimit(pets.length);
		setIsFetching(false);
	});

	useEffect(() => {
		findByStatus(Status.AVAILABLE).then((pets: Array<PetType>) => setPets(pets));
	}, []);

	useEffect(() => {
		Promise.all(
			pets
				.filter((pet: PetType) => !query || pet.name.match(new RegExp(query, 'i')))
				.slice(0, limit)
				.map(async (pet: PetType) => {
					const { data } = await RandomDog.get(`random?petId=${pet.id}`);

					pet.photoUrl = data.message;
					return pet;
				})
		).then((result: Array<PetType>) => {
			console.log(result.length);

			setFilteredPets(result);
		});
	}, [pets, limit, query]);

	return (
		<>
			<CardColumns>
				{filteredPets.map((pet: PetType, idx: number) => (
					<Card key={idx} pet={pet} />
				))}
			</CardColumns>
			{isFetching ? 'Fetching...' : ''}
		</>
	);
};

export default List;
