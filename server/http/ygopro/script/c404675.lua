--Mithra the Thunder Vassal
function c404675.initial_effect(c)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(57143342,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_HAND)
	e2:SetCountLimit(1,404675)
	e2:SetCondition(c404675.tokencon)
	e2:SetTarget(c404675.sptg)
	e2:SetOperation(c404675.spop)
	c:RegisterEffect(e2)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_BE_MATERIAL)
	e2:SetCountLimit(1,404676)
	e2:SetOperation(c404675.spr)
	c:RegisterEffect(e2)
end
function c404675.tokencon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsPlayerCanSpecialSummonMonster(tp,65145614,0,0x4011,800,1000,1,RACE_THUNDER,ATTRIBUTE_LIGHT,POS_FACEUP_DEFENCE,1-tp)
end
function c404675.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanSpecialSummonMonster(tp,65145614,0,0x4011,800,1000,1,RACE_THUNDER,ATTRIBUTE_LIGHT,POS_FACEUP_DEFENCE,1-tp)
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c404675.spop(e,tp,eg,ep,ev,re,r,rp,c)
	if Duel.GetLocationCount(1-tp,LOCATION_MZONE,tp)<=0
		or not Duel.IsPlayerCanSpecialSummonMonster(tp,65145614,0,0x4011,800,1000,1,RACE_THUNDER,ATTRIBUTE_LIGHT,POS_FACEUP_DEFENCE,1-tp) then return end
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
		if e:GetHandler():IsRelateToEffect(e) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
	local token=Duel.CreateToken(tp,65145614)
	Duel.SpecialSummonStep(token,0,tp,1-tp,false,false,POS_FACEUP_DEFENCE)
	Duel.SpecialSummonComplete()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c404675.sumlimit)
	Duel.RegisterEffect(e1,tp)
end
function c404675.sumlimit(e,c,sump,sumtype,sumpos,targetp,se)
	return c:IsLocation(LOCATION_EXTRA)
end
function c404675.spr(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if r==REASON_SUMMON then
		if Duel.GetFlagEffect(tp,404675)~=0 then return end
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetTargetRange(LOCATION_HAND,0)
		e1:SetCode(EFFECT_EXTRA_SUMMON_COUNT)
		e1:SetTarget(aux.TargetBoolFunction(Card.IsLevelAbove,5))
		e1:SetValue(0x1)
		e1:SetReset(RESET_PHASE+PHASE_END)
		Duel.RegisterEffect(e1,tp)
		Duel.RegisterFlagEffect(tp,404675,RESET_PHASE+PHASE_END,0,1)
	end
end
