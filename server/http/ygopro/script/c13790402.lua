--Barbar, Malebranche of the Burning Abyss
function c13790402.initial_effect(c)
	--self destroy
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_SELF_DESTROY)
	e1:SetCondition(c13790402.sdcon)
	c:RegisterEffect(e1)
	--Special Summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13790402,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_HAND)
	e2:SetCountLimit(1,13790402)
	e2:SetCondition(c13790402.sscon)
	e2:SetTarget(c13790402.sstg)
	e2:SetOperation(c13790402.ssop)
	c:RegisterEffect(e2)
	--remove
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(13790402,1))
	e3:SetCategory(CATEGORY_REMOVE)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetCountLimit(1,13790402)
	e3:SetCondition(c13790402.rmcon)
	e3:SetOperation(c13790402.rmop)
	c:RegisterEffect(e3)
end
function c13790402.sdfilter(c)
	return not c:IsFaceup() or not c:IsSetCard(0xb1)
end
function c13790402.sdcon(e)
	return Duel.IsExistingMatchingCard(c13790402.sdfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c13790402.filter(c)
	return c:IsType(TYPE_SPELL+TYPE_TRAP)
end
function c13790402.sscon(e,tp,eg,ep,ev,re,r,rp)
	return not Duel.IsExistingMatchingCard(c13790402.filter,tp,LOCATION_ONFIELD,0,1,nil)
end
function c13790402.sstg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c13790402.ssop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.IsExistingMatchingCard(c13790402.filter,tp,LOCATION_ONFIELD,0,1,nil) then return end
	if e:GetHandler():IsRelateToEffect(e) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
end
function c13790402.rmcon(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsReason(REASON_RETURN)
end
function c13790402.rmop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(17559367,1))
	local g=Duel.SelectMatchingCard(tp,Card.IsSetCard,tp,LOCATION_DECK,0,1,1,nil,0xb1)
	local tc=g:GetFirst()
	if tc then
		Duel.ShuffleDeck(tp)
		Duel.MoveSequence(tc,0)
		Duel.ConfirmDecktop(tp,1)
	end
end
