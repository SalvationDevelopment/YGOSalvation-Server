--Scripted by Eerie Code
--Erebus the Netherworld Monarch
function c23064604.initial_effect(c)
	--Summon with 1 tribute
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(23064604,0))
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SUMMON_PROC)
	e1:SetCondition(c23064604.otcon)
	e1:SetOperation(c23064604.otop)
	e1:SetValue(SUMMON_TYPE_ADVANCE)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_SET_PROC)
	c:RegisterEffect(e2)
	--Shuffle
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(23064604,1))
	e3:SetCategory(CATEGORY_TODECK)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_DELAY)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetCondition(c23064604.tdcon)
	e3:SetTarget(c23064604.tdtg)
	e3:SetOperation(c23064604.tdop)
	c:RegisterEffect(e3)
	--Recover
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(23064604,2))
	e4:SetCategory(CATEGORY_TOHAND)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetCode(EVENT_FREE_CHAIN)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetRange(LOCATION_GRAVE)
	e4:SetHintTiming(0,TIMING_MAIN_END)
	e4:SetCountLimit(1)
	e4:SetCondition(c23064604.thcon)
	e4:SetCost(c23064604.thcost)
	e4:SetTarget(c23064604.thtg)
	e4:SetOperation(c23064604.thop)
	c:RegisterEffect(e4)
end

function c23064604.otfilter(c)
	return bit.band(c:GetSummonType(),SUMMON_TYPE_ADVANCE)==SUMMON_TYPE_ADVANCE
end
function c23064604.otcon(e,c)
	if c==nil then return true end
	local mg=Duel.GetMatchingGroup(c23064604.otfilter,0,LOCATION_MZONE,LOCATION_MZONE,nil)
	return c:GetLevel()>6 and Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>-1
		and Duel.GetTributeCount(c,mg)>0
end
function c23064604.otop(e,tp,eg,ep,ev,re,r,rp,c)
	local mg=Duel.GetMatchingGroup(c23064604.otfilter,0,LOCATION_MZONE,LOCATION_MZONE,nil)
	local sg=Duel.SelectTribute(tp,c,1,1,mg)
	c:SetMaterial(sg)
	Duel.Release(sg,REASON_SUMMON+REASON_MATERIAL)
end

function c23064604.tdcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_ADVANCE
end
function c23064604.tdfil1(c)
	return c:IsSetCard(0xbe) and c:IsAbleToGraveAsCost()
end
function c23064604.tdtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then 
		return Duel.GetMatchingGroup(c23064604.tdfil1,tp,LOCATION_HAND+LOCATION_DECK,0,nil):GetClassCount(Card.GetCode)>=2 and Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,0,LOCATION_ONFIELD+LOCATION_HAND+LOCATION_GRAVE,1,nil)
	end
end
function c23064604.tdop(e,tp,eg,ep,ev,re,r,rp)
	local g1=Duel.GetMatchingGroup(c23064604.tdfil1,tp,LOCATION_HAND+LOCATION_DECK,0,nil)
	local cg=Group.CreateGroup()
	for i=1,2 do
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local sg=g1:Select(tp,1,1,nil)
		g1:Remove(Card.IsCode,nil,sg:GetFirst():GetCode())
		cg:Merge(sg)
	end
	if Duel.SendtoGrave(cg,REASON_COST)>0 then
		local g2=Duel.SelectMatchingCard(tp,Card.IsAbleToDeck,tp,0,LOCATION_ONFIELD+LOCATION_HAND+LOCATION_GRAVE,1,1,nil)
		if g2:GetCount()>0 then Duel.SendtoDeck(g2,nil,2,REASON_EFFECT) end
	end
end

function c23064604.thfil1(c)
	return c:IsSetCard(0xbe) and c:IsDiscardable()
end
function c23064604.thcon(e,tp,eg,ep,ev,re,r,rp)
	local ph=Duel.GetCurrentPhase()
	return ph==PHASE_MAIN1 or ph==PHASE_MAIN2
end
function c23064604.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c23064604.thfil1,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,c23064604.thfil1,1,1,REASON_COST+REASON_DISCARD)
end
function c23064604.thfilter(c)
	return c:IsType(TYPE_MONSTER) and c:IsAttackAbove(2400) and c:GetDefence()==1000 and c:IsAbleToHand()
end
function c23064604.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c23064604.thfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c23064604.thfilter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c23064604.thfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c23064604.thop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end