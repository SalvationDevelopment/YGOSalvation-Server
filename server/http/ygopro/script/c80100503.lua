--DDD Haryuuou Pendragon (DDD Pendragon the Supreme Dragon King)
function c80100503.initial_effect(c)
	--summon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND)
	e1:SetCost(c80100503.cost)
	e1:SetTarget(c80100503.target)
	e1:SetOperation(c80100503.operation)
	c:RegisterEffect(e1)
	--atk up
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(18318842,0))
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c80100503.atkcost)
	e1:SetOperation(c80100503.atkoperation)
	c:RegisterEffect(e1)
end
function c80100503.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	e:SetLabel(1)
	if chk==0 then return Duel.CheckReleaseGroupEx(tp,Card.IsRace,1,nil,RACE_DRAGON)
	and Duel.CheckReleaseGroup(tp,Card.IsRace,1,nil,RACE_FIEND) end
	local g1=Duel.SelectReleaseGroupEx(tp,Card.IsRace,1,1,nil,RACE_DRAGON)
	local g2=Duel.SelectReleaseGroupEx(tp,Card.IsRace,1,1,nil,RACE_FIEND)
	g1:Merge(g2)
	Duel.Release(g1,REASON_COST)
end
function c80100503.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c80100503.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,1,tp,tp,false,false,POS_FACEUP)
	end
end
function c80100503.filter(c)
	return c:IsDiscardable() and c:IsAbleToGraveAsCost()
end
function c80100503.filter2(c)
	return c:IsDestructable() and c:IsType(TYPE_SPELL+TYPE_TRAP)
end
function c80100503.atkcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100503.filter,tp,LOCATION_HAND,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c80100503.filter,tp,LOCATION_HAND,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST)
end
function c80100503.atkoperation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(500)
		e1:SetReset(RESET_EVENT+0x1ff0000)
		c:RegisterEffect(e1)
		local dg=Duel.GetMatchingGroup(c80100503.filter2,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,nil)
		if dg:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(80100503,0)) then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local des=dg:Select(tp,1,1,nil)
			Duel.HintSelection(des)
			Duel.BreakEffect()
			Duel.Destroy(des,REASON_EFFECT)
		end
	end
end