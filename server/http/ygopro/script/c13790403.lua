--Dante, Pilgrim of the Burning Abyss
function c13790403.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_FUSION_MATERIAL)
	e1:SetCondition(c13790403.fscon)
	e1:SetOperation(c13790403.fsop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOGRAVE+CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c13790403.target)
	e2:SetOperation(c13790403.operation)
	e2:SetHintTiming(0,TIMING_MAIN_END)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetValue(aux.tgoval)
	c:RegisterEffect(e3)
	--spsummon
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e4:SetCondition(c13790403.spcon1)
	e4:SetTarget(c13790403.sptg)
	e4:SetOperation(c13790403.spop)
	c:RegisterEffect(e4)
	local e5=e4:Clone()
	e5:SetCode(EVENT_BATTLE_DESTROYED)
	e5:SetCondition(c13790403.spcon2)
	c:RegisterEffect(e5)
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_SINGLE)
	e6:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e6:SetCode(EFFECT_SPSUMMON_CONDITION)
	e6:SetValue(c13790403.splimit)
	c:RegisterEffect(e6)
end
c13790403.material_count=3
function c13790403.splimit(e,se,sp,st)
	return bit.band(st,SUMMON_TYPE_FUSION)==SUMMON_TYPE_FUSION
end
function c13790403.mfilter(c,mg)
	return c:IsSetCard(0xb1)
end
function c13790403.fscon(e,mg,gc)
	if mg==nil then return false end
	if gc then return false end
	local g=Duel.GetMatchingGroup(c13790403.mfilter,e:GetHandlerPlayer(),LOCATION_HAND+LOCATION_MZONE,0,nil)
	return mg:IsExists(c13790403.mfilter,1,nil,mg) and g:GetClassCount(Card.GetCode)>=3
end
function c13790403.fsop(e,tp,eg,ep,ev,re,r,rp,gc)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FMATERIAL)
	local g1=eg:FilterSelect(tp,c13790403.mfilter,1,1,nil,eg)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FMATERIAL)
	eg:Remove(Card.IsCode,nil,g1:GetFirst():GetCode())
	local g2=eg:FilterSelect(tp,c13790403.mfilter,1,1,nil,eg)
	eg:Remove(Card.IsCode,nil,g2:GetFirst():GetCode())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FMATERIAL)
	local g3=eg:FilterSelect(tp,c13790403.mfilter,1,1,nil,eg)
	g1:Merge(g2)
	g1:Merge(g3)
	Duel.SetFusionMaterial(g1)
end

function c13790403.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1)
		and Duel.IsExistingMatchingCard(Card.IsSetCard,tp,LOCATION_HAND,0,1,nil,0xb1) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_HAND)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c13790403.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,Card.IsSetCard,tp,LOCATION_HAND,0,1,1,nil,0xb1)
	if g:GetCount()>0 and Duel.SendtoGrave(g,REASON_EFFECT)~=0 and g:GetFirst():IsLocation(LOCATION_GRAVE) then
		Duel.Draw(tp,1,REASON_EFFECT)
	end
end

function c13790403.spcon1(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and bit.band(r,REASON_EFFECT)~=0 and e:GetHandler():GetPreviousControler()==tp
		and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c13790403.spcon2(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsLocation(LOCATION_GRAVE) and e:GetHandler():IsReason(REASON_BATTLE)
end
function c13790403.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.GetFieldGroupCount(tp,0,LOCATION_HAND)>0 end
	Duel.SetOperationInfo(0,CATEGORY_HANDES,0,0,1-tp,1)
end
function c13790403.spop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(1-tp,LOCATION_HAND,0)
	if g:GetCount()==0 then return end
	local sg=g:RandomSelect(1-tp,1)
	Duel.SendtoGrave(sg,REASON_EFFECT)
end
