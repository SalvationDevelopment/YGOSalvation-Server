--Speedroid Menkoto
function c16947147.initial_effect(c)
	--summon and flip
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(19665973,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c16947147.condition)
	e1:SetTarget(c16947147.target)
	e1:SetOperation(c16947147.operation)
	c:RegisterEffect(e1)
end
function c16947147.filter(c)
	return c:IsFaceup() and c:IsAttackPos()
end
function c16947147.condition(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	return at:GetControler()~=tp and Duel.GetAttackTarget()==nil
end
function c16947147.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then
		return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,c,1,0,0)
end
function c16947147.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c16947147.filter,tp,0,LOCATION_MZONE,nil)
	if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP_ATTACK)>0 then
			Duel.ChangePosition(g,POS_FACEUP_DEFENCE)
	end
end