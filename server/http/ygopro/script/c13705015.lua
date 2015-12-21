--DDD Pendragon the Supreme Dragon King
function c13705015.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c13705015.spcon)
	e1:SetOperation(c13705015.spop)
	c:RegisterEffect(e1)
	--atk up
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(94283662,0))
	e2:SetCategory(CATEGORY_HANDES+CATEGORY_ATKCHANGE)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c13705015.target)
	e2:SetOperation(c13705015.operation)
	c:RegisterEffect(e2)
end
function c13705015.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(Card.IsRace,tp,LOCATION_MZONE+LOCATION_HAND,0,1,nil,RACE_FIEND)
		and Duel.IsExistingMatchingCard(Card.IsRace,tp,LOCATION_MZONE+LOCATION_HAND,0,1,nil,RACE_DRAGON)
end
function c13705015.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,Card.IsRace,tp,LOCATION_MZONE+LOCATION_HAND,0,1,1,nil,RACE_FAIRY)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,Card.IsRace,tp,LOCATION_MZONE+LOCATION_HAND,0,1,1,nil,RACE_DRAGON)
	g1:Merge(g2)
	Duel.Release(g1,REASON_COST)
end

function c13705015.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsAbleToGraveAsCost,tp,LOCATION_HAND,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_HANDES,nil,0,tp,1)
end
function c13705015.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local ct=Duel.DiscardHand(tp,Card.IsAbleToGraveAsCost,1,1,REASON_EFFECT+REASON_DISCARD,nil)
	if ct>0 and c:IsFaceup() and c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1ff0000+RESET_PHASE+PHASE_END)
		e1:SetValue(500)
		c:RegisterEffect(e1)
		local dg=Duel.GetMatchingGroup(Card.IsDestructable,tp,LOCATION_SZONE,LOCATION_SZONE,nil)
		if dg:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(13705015,0)) then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local des=dg:Select(tp,1,1,nil)
			Duel.HintSelection(des)
			Duel.BreakEffect()
			Duel.Destroy(des,REASON_EFFECT)
		end
	end
end
