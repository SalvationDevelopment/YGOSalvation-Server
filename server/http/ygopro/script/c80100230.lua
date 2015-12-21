--D·スマホン
function c80100230.initial_effect(c)
	c:EnableReviveLimit()
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c80100230.spcon)
	e1:SetOperation(c80100230.spop)
	c:RegisterEffect(e1)
	--to hand
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100230,0))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c80100230.cona)
	e2:SetTarget(c80100230.tga)
	e2:SetOperation(c80100230.opa)
	c:RegisterEffect(e2)
	--confirm
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100230,1))
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetCountLimit(1)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c80100230.cond)
	e3:SetTarget(c80100230.tgd)
	e3:SetOperation(c80100230.opd)
	c:RegisterEffect(e3)
end
function c80100230.spfilter(c)
	return c:IsSetCard(0x26) and c:IsType(TYPE_MONSTER) and c:IsAbleToRemoveAsCost()
end
function c80100230.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100230.spfilter,tp,LOCATION_GRAVE,0,1,nil)
end
function c80100230.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g1=Duel.SelectMatchingCard(tp,c80100230.spfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
end
function c80100230.cona(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsDisabled() and e:GetHandler():IsAttackPos()
end
function c80100230.cond(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsDisabled() and e:GetHandler():IsDefencePos()
end
function c80100230.cfilter(c)
	return c:IsSetCard(0x26) and c:IsAbleToHand()
end
function c80100230.tga(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0
		and Duel.IsExistingMatchingCard(c80100230.cfilter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_DICE,nil,0,tp,1)
end
function c80100230.tgd(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
	Duel.SetOperationInfo(0,CATEGORY_DICE,nil,0,tp,1)
end
function c80100230.opa(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	local dc=Duel.TossDice(tp,1)
	Duel.ConfirmDecktop(tp,dc)
	local g=Duel.GetDecktopGroup(tp,dc):Filter(c80100230.cfilter,nil)
	if g:GetCount()>0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local sg=g:Select(tp,1,1,nil)
		if sg:GetFirst():IsAbleToHand() then
			Duel.SendtoHand(sg,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,sg)
			Duel.ShuffleHand(tp)
		else
			Duel.SendtoGrave(sg,REASON_RULE)
		end
		Duel.ShuffleDeck(tp)
	end
end
function c80100230.opd(e,tp,eg,ep,ev,re,r,rp)
	local count=Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)
	if count==0 then return end
	local dc=Duel.TossDice(tp,1)
	if count<dc then
		dc=count
	end
	Duel.SortDecktop(tp,tp,dc)
	if Duel.SelectOption(tp,aux.Stringid(80100230,2),aux.Stringid(80100230,3))==1 then
		for i=1,dc do
			local mg=Duel.GetDecktopGroup(tp,1)
			Duel.MoveSequence(mg:GetFirst(),1)
		end
	end
end
