--Wall of Ivy
function c11111139.initial_effect(c)
	--token
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(11111139,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e1:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_SINGLE)
	e1:SetCode(EVENT_FLIP)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c11111139.target)
	e1:SetOperation(c11111139.operation)
	c:RegisterEffect(e1)
	--be battle target
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(11111139,0))
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetTarget(c11111139.target)
	e2:SetOperation(c11111139.operation)
	c:RegisterEffect(e2)
end
function c11111139.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c11111139.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(1-tp,LOCATION_MZONE)<=0 then return end
	if not Duel.IsPlayerCanSpecialSummonMonster(tp,11111140,0,0x4011,0,0,1,RACE_PLANT,ATTRIBUTE_EARTH,POS_FACEUP_DEFENCE,1-tp) then return end
	local token=Duel.CreateToken(tp,11111140)
	if Duel.SpecialSummonStep(token,0,tp,1-tp,false,false,POS_FACEUP_DEFENCE) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_DESTROY)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetOperation(c11111139.damop)
		token:RegisterEffect(e1,true)
	end
	Duel.SpecialSummonComplete()
end
function c11111139.damop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Damage(tp,300,REASON_EFFECT)
end
