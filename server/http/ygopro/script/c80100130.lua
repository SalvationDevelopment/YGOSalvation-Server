--聖霊獣騎 カンナホーク
function c80100130.initial_effect(c)
	c:EnableReviveLimit()
	--fusion material
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_FUSION_MATERIAL)
	e1:SetCondition(c80100130.fscondition)
	e1:SetOperation(c80100130.fsoperation)
	c:RegisterEffect(e1)
	--spsummon condition
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetCode(EFFECT_SPSUMMON_CONDITION)
	e2:SetValue(c80100130.splimit)
	c:RegisterEffect(e2)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_SPSUMMON_PROC)
	e3:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e3:SetRange(LOCATION_EXTRA)
	e3:SetCondition(c80100130.spcon)
	e3:SetOperation(c80100130.spop)
	c:RegisterEffect(e3)
	--spsummon
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetDescription(aux.Stringid(80100130,0))
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetCode(EVENT_FREE_CHAIN)
	e4:SetHintTiming(0,0x1c0)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCost(c80100130.cost)
	e4:SetTarget(c80100130.target)
	e4:SetOperation(c80100130.operation)
	c:RegisterEffect(e4)	
	--tohand
	local e5=Effect.CreateEffect(c)
	e5:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH+CATEGORY_TOGRAVE)
	e5:SetDescription(aux.Stringid(80100130,1))
	e5:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e5:SetType(EFFECT_TYPE_IGNITION)
	e5:SetCountLimit(1)
	e5:SetRange(LOCATION_MZONE)
	e5:SetTarget(c80100130.thtarget)
	e5:SetOperation(c80100130.thoperation)
	c:RegisterEffect(e5)
end
function c80100130.matfilter(c,mg)
	return c:IsSetCard(0x10b5) and mg:IsExists(c80100130.spfilter2,1,c)
end
function c80100130.matfilter2(c)
	return c:IsSetCard(0x20b5)
end
function c80100130.fscondition(e,mg,gc)
	if mg==nil then return true end
	if gc then return false end
	return mg:IsExists(c80100130.spfilter,1,nil,mg)
end
function c80100130.fsoperation(e,tp,eg,ep,ev,re,r,rp,gc)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FMATERIAL)
	local g1=eg:FilterSelect(tp,c80100130.matfilter,1,1,nil,eg)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FMATERIAL)
	local g2=eg:FilterSelect(tp,c80100130.matfilter2,1,1,g1:GetFirst(),g1:GetFirst():GetCode())
	g1:Merge(g2)
	Duel.SetFusionMaterial(g1)
end
function c80100130.splimit(e,se,sp,st)
	return not e:GetHandler():IsLocation(LOCATION_EXTRA)
end
function c80100130.spfilter(c,code)
	return c:IsSetCard(0x10b5) and c:IsAbleToRemoveAsCost()
end
function c80100130.spfilter2(c,code)
	return c:IsSetCard(0x20b5) and c:IsAbleToRemoveAsCost()
end
function c80100130.spcon(e,c)
	if c==nil then return true end 
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-2
		and Duel.IsExistingMatchingCard(c80100130.spfilter,tp,LOCATION_MZONE,0,1,nil)
		and Duel.IsExistingMatchingCard(c80100130.spfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c80100130.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	local g1=Duel.SelectMatchingCard(tp,c80100130.spfilter,tp,LOCATION_MZONE,0,1,1,nil)
	local g2=Duel.SelectMatchingCard(tp,c80100130.spfilter2,tp,LOCATION_MZONE,0,1,1,nil)
	g1:Merge(g2)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
end
function c80100130.filter(c,e,tp)
	return c:IsFaceup() and c:IsSetCard(0x10b5) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100130.filter2(c,e,tp)
	return c:IsFaceup() and c:IsSetCard(0x20b5) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100130.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsAbleToExtraAsCost() end
	Duel.SendtoDeck(c,nil,0,REASON_COST)
end
function c80100130.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_REMOVED) and chkc:IsControler(tp) and c80100130.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c80100130.filter,tp,LOCATION_REMOVED,0,1,nil,e,tp)
		and Duel.IsExistingTarget(c80100130.filter2,tp,LOCATION_REMOVED,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80100130.filter,tp,LOCATION_REMOVED,0,1,1,nil,e,tp)
	local g1=Duel.SelectTarget(tp,c80100130.filter2,tp,LOCATION_REMOVED,0,1,1,nil,e,tp)
	g:Merge(g1)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,g:GetCount,0,0)
end
function c80100130.operation(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	if sg:GetCount()>ft then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		sg=sg:Select(tp,ft,ft,nil)
	end
	Duel.SpecialSummon(sg,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
end
function c80100130.thfilter(c)
	return c:IsSetCard(0xb5) and c:IsAbleToHand()
end
function c80100130.tgfilter(c)
	return c:IsSetCard(0xb5)
end
function c80100130.thtarget(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_REMOVED) and c80100130.tgfilter(chkc) end
	if chk==0 then return Duel.IsExistingMatchingCard(c80100130.thfilter,tp,LOCATION_DECK,0,1,nil)
		and Duel.IsExistingTarget(c80100130.tgfilter,tp,LOCATION_REMOVED,0,2,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectTarget(tp,c80100130.tgfilter,tp,LOCATION_REMOVED,0,2,2,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80100130.thoperation(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=tg:Filter(Card.IsRelateToEffect,nil,e)
	if sg:GetCount()>0 then
		Duel.SendtoGrave(sg,REASON_EFFECT+REASON_RETURN)
		
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g=Duel.SelectMatchingCard(tp,c80100130.thfilter,tp,LOCATION_DECK,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoHand(g,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,g)
		end
	end
end