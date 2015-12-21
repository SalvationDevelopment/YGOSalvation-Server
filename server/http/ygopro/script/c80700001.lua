--除雪機関車ハッスル・ラッセル
function c80700001.initial_effect(c)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80700002,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_DESTROY+CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c80700001.spcon)
	e1:SetTarget(c80700001.sptg)
	e1:SetOperation(c80700001.spop)
	c:RegisterEffect(e1)
	--cannot special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(1,0)
	e2:SetTarget(c80700001.splimit)
	c:RegisterEffect(e2)
end
function c80700001.cfilter(c)
	return c:GetSequence()~=5
end
function c80700001.spcon(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	return Duel.IsExistingMatchingCard(c80700001.cfilter,tp,LOCATION_SZONE,0,1,nil) and at:GetControler()~=tp and Duel.GetAttackTarget()==nil
end
function c80700001.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and c:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.ConfirmCards(1-tp,c)
	Duel.ShuffleHand(tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,c,1,0,0)
end
function c80700001.filter(c)
	return c:GetSequence()~=5 and c:IsDestructable()
end
function c80700001.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
		Duel.BreakEffect()
		local sg=Duel.GetMatchingGroup(c80700001.filter,tp,LOCATION_SZONE,0,nil)
		local ct=Duel.Destroy(sg,REASON_EFFECT)
		Duel.Damage(1-tp,ct*200,REASON_EFFECT)
	end
end
function c80700001.splimit(e,c,tp,sumtp,sumpos)
	return not c:IsRace(RACE_MACHINE)
end
